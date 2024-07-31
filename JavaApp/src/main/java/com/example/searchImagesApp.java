package com.example;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class searchImagesApp {
    private Properties properties;
    protected IMqttClient mqttClient;
    protected Connection dbConnection;
    private ThreadPoolExecutor executorService = (ThreadPoolExecutor) Executors.newCachedThreadPool();
    private Set<String> userIdSet = new HashSet<>();

    public searchImagesApp() throws IOException {
        loadProperties();
        connectToDatabase();
        try {
            connectToMQTTBroker();
            listenToNewUsers();
            listenToUploads();
            listenToDeleteImages();
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    protected void loadProperties() throws IOException {
        properties = new Properties();
        properties.load(searchImagesApp.class.getClassLoader().getResourceAsStream("config.properties"));

    }

    protected void connectToDatabase() {
        String dbUrl = properties.getProperty("db.url");
        String dbUsername = properties.getProperty("db.username");
        String dbPassword = properties.getProperty("db.password");

        try {
            dbConnection = DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
            System.out.println("Connected to database: " + dbConnection);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    protected void connectToMQTTBroker() throws MqttException {
        String mqttBroker = properties.getProperty("mqtt.broker");
        try {
            mqttClient = new MqttClient(mqttBroker, "JavaApp");
            mqttClient.connect();
        } catch (MqttException e) {
            throw new MqttException(e);
        }
    }

    protected void listenToNewUsers() {
        try {
            mqttClient.subscribe("userConnected", (topic, message) -> {
                String jsonMessage = new String(message.getPayload());
                try {
                    JSONObject jsonObject = new JSONObject(jsonMessage);
                    String userId = jsonObject.getString("id");

                    if (userIdSet.add(userId)) {
                        System.out.println("New user connected: " + userId);

                        try {
                            mqttClient.subscribe(userId + "/find_images", (topicIma, findImaMessage) -> {
                                String receivedMessage = new String(findImaMessage.getPayload());
                                System.out.println(
                                        "Received message on /find_images from user " + userId + ": "
                                                + receivedMessage);
                                executorService.execute(() -> processFindIma(userId, receivedMessage));
                            });
                            System.out.println("Subscribed to " + userId + "/find_images" + " for user " + userId);
                        } catch (MqttException e) {
                            e.printStackTrace();
                        }

                    } else {
                        System.out.println("User " + userId + " already exists in userIdSet");
                    }

                } catch (JSONException e) {
                    e.printStackTrace();
                }
                // print userIdSet
                System.out.println("userIdSet: " + userIdSet);
            });
            mqttClient.subscribe("userDisconnected", (topic, message) -> {
                String jsonMessage = new String(message.getPayload());
                try {
                    JSONObject jsonObject = new JSONObject(jsonMessage);
                    String userId = jsonObject.getString("id");

                    if (userIdSet.remove(userId)) {
                        System.out.println("User disconnected: " + userId);
                        mqttClient.unsubscribe(userId + "/find_images");
                        System.out.println("Unsubscribed from " + userId + "/find_images" + " for user " + userId);
                    } else {
                        System.out.println("User " + userId + " not found in userIdSet");
                    }

                } catch (JSONException e) {
                    e.printStackTrace();
                }
                // print userIdSet
                System.out.println("userIdSet: " + userIdSet);
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
        System.out.println("User listener started");
    }

    protected void processFindIma(String userId, String message) {
        try {
            JSONObject jsonMessage = new JSONObject(message);

            JSONObject bottomLeftObject = jsonMessage.getJSONObject("bottomLeft");
            double bottomLeftLong = bottomLeftObject.getDouble("lon");
            double bottomLeftLat = bottomLeftObject.getDouble("lat");

            JSONObject topRightObject = jsonMessage.getJSONObject("topRight");
            double topRightLong = topRightObject.getDouble("lon");
            double topRightLat = topRightObject.getDouble("lat");

            String topicInput = jsonMessage.getString("topic");

            // Modifica la query per includere i topic e le coordinate
            String query = "SELECT i.id_ima, i.latitude, i.longitude, i.owner_id " +
                    "FROM images i " +
                    "JOIN image_topic it ON i.id_ima = it.idr_ima " +
                    "JOIN topics t ON it.idr_top = t.id_top " +
                    "WHERE i.latitude BETWEEN ? AND ? " +
                    "AND i.longitude BETWEEN ? AND ? " +
                    "AND t.name = ?";

            try (PreparedStatement pstmt = dbConnection.prepareStatement(query)) {
                pstmt.setDouble(1, bottomLeftLat);
                pstmt.setDouble(2, topRightLat);
                pstmt.setDouble(3, bottomLeftLong);
                pstmt.setDouble(4, topRightLong);
                pstmt.setString(5, topicInput);

                ResultSet resultSet = pstmt.executeQuery();
                System.out.println("Result set length: " + resultSet.getFetchSize());
                JSONArray imagesArray = new JSONArray();

                while (resultSet.next()) {
                    // get image details
                    int imageId = resultSet.getInt("id_ima");
                    String imageIdStr = resultSet.getString("id_ima");
                    double latitude = resultSet.getDouble("latitude");
                    double longitude = resultSet.getDouble("longitude");
                    int ownerId = resultSet.getInt("owner_id");

                    String queryTopic = "SELECT t.name " +
                            "FROM topics t " +
                            "JOIN image_topic it ON t.id_top = it.idr_top " +
                            "WHERE it.idr_ima = ?";

                    try (PreparedStatement pstmtTopic = dbConnection.prepareStatement(queryTopic)) {
                        pstmtTopic.setInt(1, imageId);
                        ResultSet resultSetTopic = pstmtTopic.executeQuery();

                        JSONArray topicsArray = new JSONArray();
                        while (resultSetTopic.next()) {
                            String topic = resultSetTopic.getString("name");
                            topicsArray.put(topic);
                        }

                        JSONObject imageObject = new JSONObject();
                        imageObject.put("imageId", imageIdStr);
                        imageObject.put("lat", latitude);
                        imageObject.put("lon", longitude);
                        imageObject.put("ownerId", ownerId);
                        imageObject.put("topics", topicsArray);
                        imagesArray.put(imageObject);
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }

                JSONObject response = new JSONObject();
                response.put("imageDataList", new JSONArray(imagesArray));
                System.out.println("Sending response to user " + userId + ": " + response);

                mqttClient.publish(userId + "/image_data", new MqttMessage(response.toString().getBytes()));
            }
        } catch (SQLException | JSONException | MqttException e) {
            e.printStackTrace();
        }
    }

    protected void listenToUploads() {
        try {
            mqttClient.subscribe("uploadPhoto", (topic, message) -> {
                String jsonMessage = new String(message.getPayload());
                try {
                    JSONObject jsonObject = new JSONObject(jsonMessage);
                    System.out.println("Received upload request: " + jsonObject);
                    String requestId = jsonObject.getString("requestId");
                    JSONArray hashtags = jsonObject.getJSONArray("hashtags");
                    double latitude = jsonObject.optDouble("latitude", Double.NaN);
                    double longitude = jsonObject.optDouble("longitude", Double.NaN);
                    int ownerId = jsonObject.optInt("ownerId", -1);

                    UploadResult uploadResult = handleUpload(hashtags, ownerId, latitude, longitude);

                    JSONObject response = new JSONObject();
                    response.put("requestId", requestId);
                    response.put("status", uploadResult.success ? "good" : "bad");
                    if (uploadResult.success) {
                        response.put("imageId", uploadResult.imageId);
                    }

                    mqttClient.publish("uploadConfirm", new MqttMessage(response.toString().getBytes()));

                } catch (JSONException e) {
                    e.printStackTrace();
                } catch (MqttException e) {
                    e.printStackTrace();
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
        System.out.println("Upload listener started");
    }

    private UploadResult handleUpload(JSONArray hashtags, int ownerId, double latitude, double longitude) {
        if (ownerId < 0) {
            System.err.println("Invalid ownerId: " + ownerId);
            return new UploadResult(false, -1);
        }

        try {
            int imageId = savePhoto(ownerId, latitude, longitude);
            saveHashtags(hashtags, imageId);

            return new UploadResult(true, imageId);
        } catch (Exception e) {
            e.printStackTrace();
            return new UploadResult(false, -1);
        }
    }

    private int savePhoto(int ownerId, double latitude, double longitude) throws SQLException {
        String sql = "INSERT INTO images (owner_id, latitude, longitude) VALUES (?, ?, ?) RETURNING id_ima";
        try (PreparedStatement pstmt = dbConnection.prepareStatement(sql)) {
            pstmt.setInt(1, ownerId);
            pstmt.setDouble(2, latitude);
            pstmt.setDouble(3, longitude);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("id_ima");
            } else {
                throw new SQLException("Failed to retrieve generated ID");
            }
        }
    }

    private void saveHashtags(JSONArray hashtags, int imageId) throws SQLException {
        String sqlInsertTopic = "INSERT INTO topics (name) VALUES (?) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id_top";
        String sqlInsertImageTopic = "INSERT INTO image_topic (idr_ima, idr_top) VALUES (?, ?)";

        try (PreparedStatement pstmtInsertTopic = dbConnection.prepareStatement(sqlInsertTopic);
                PreparedStatement pstmtInsertImageTopic = dbConnection.prepareStatement(sqlInsertImageTopic)) {

            for (int i = 0; i < hashtags.length(); i++) {
                String hashtag = hashtags.getString(i);

                pstmtInsertTopic.setString(1, hashtag);
                try (ResultSet rs = pstmtInsertTopic.executeQuery()) {
                    if (rs.next()) {
                        int topicId = rs.getInt("id_top");

                        pstmtInsertImageTopic.setInt(1, imageId);
                        pstmtInsertImageTopic.setInt(2, topicId);
                        pstmtInsertImageTopic.executeUpdate();
                    } else {
                        throw new SQLException("Failed to retrieve topic ID");
                    }
                }
            }
        }
    }

    private static class UploadResult {
        boolean success;
        int imageId;

        UploadResult(boolean success, int imageId) {
            this.success = success;
            this.imageId = imageId;
        }
    }

    protected void listenToDeleteImages() {
        try {
            mqttClient.subscribe("deletePhoto", (topic, message) -> {
                String jsonMessage = new String(message.getPayload());
                JSONObject jsonObject = new JSONObject(jsonMessage);
                System.out.println("Received delete request: " + jsonObject);
                int imageId = jsonObject.getInt("imageId");
                String requestId = jsonObject.getString("requestId");
                JSONObject response = new JSONObject();

                try {
                    String sqlDeleteImage = "DELETE FROM images WHERE id_ima = ? RETURNING id_ima";
                    try (PreparedStatement pstmtDeleteImage = dbConnection.prepareStatement(sqlDeleteImage)) {
                        pstmtDeleteImage.setInt(1, imageId);
                        ResultSet rs = pstmtDeleteImage.executeQuery();

                        if (rs.next()) {
                            // Successfully deleted
                            response.put("status", "success");
                            response.put("message", "Image deleted successfully");
                        } else {
                            // No rows affected
                            response.put("status", "not_found");
                            response.put("message", "Image not found");
                        }
                    } catch (SQLException e) {
                        // Error during SQL operation
                        e.printStackTrace();
                        response.put("status", "error");
                        response.put("message", "Error deleting image from database");
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                    response.put("status", "error");
                    response.put("message", "Error processing JSON message");
                }

                try {
                    response.put("requestId", requestId);
                    mqttClient.publish("deleteConfirm", new MqttMessage(response.toString().getBytes()));
                } catch (MqttException e) {
                    e.printStackTrace();
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
        System.out.println("Delete listener started");
    }

    public static void main(String[] args) throws IOException {
        new searchImagesApp();
    }
}
