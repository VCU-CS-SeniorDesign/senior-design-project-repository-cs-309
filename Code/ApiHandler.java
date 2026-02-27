package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.file.*;
import java.util.stream.Collectors;

public class ApiHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");

        String method = exchange.getRequestMethod();

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("POST".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new BufferedReader(new InputStreamReader(is)).lines().collect(Collectors.joining("\n"));
            
            System.out.println("RECEIVED FROM FRONTEND: " + body); //debug

            String title = extractValue(body, "title");
            String type = extractValue(body, "type");
            String description = extractValue(body, "description");

            String regulatoryContext = searchLocalFiles(description);
            String riskLevel = determineRisk(description, regulatoryContext);
            
            String enhancedWriteup = String.format(
                "Title: %s\nDescription: %s", 
                title, description
            );

            //JSON formatting
            String safeWriteup = enhancedWriteup
                .replace("\\", "\\\\")  
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", ""); 

            String jsonResponse = String.format(
                "{\"enhancedWriteup\": \"%s\", \"riskLevel\": \"%s\"}",
                safeWriteup, riskLevel
            );

            exchange.getResponseHeaders().add("Content-Type", "application/json");
            byte[] responseBytes = jsonResponse.getBytes("UTF-8");
            exchange.sendResponseHeaders(200, responseBytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(responseBytes);
            os.close();
        } else {
            exchange.sendResponseHeaders(405, -1);
        }
    }

    private String searchLocalFiles(String query) {
        StringBuilder findings = new StringBuilder();
        try {
            Path path = Paths.get("knowledge_base");
            if (Files.exists(path)) {
                Files.list(path).forEach(file -> {
                    try {
                        String content = new String(Files.readAllBytes(file));
                        String keyword = query.split(" ")[0].toLowerCase();
                        if (content.toLowerCase().contains(keyword)) {
                            findings.append("[Source: ").append(file.getFileName()).append("] ");
                        }
                    } catch (IOException e) {}
                });
            }
        } catch (IOException e) { return "No local documentation available."; }
        
        return findings.length() > 0 ? findings.toString() : "No specific government mandate found in local library.";
    }

    private String determineRisk(String desc, String context) {
        String fullText = (desc + " " + context).toLowerCase().trim();
        
        if (fullText.contains("critical")) {
            return "High"; 
        } 
        else if (fullText.contains("moderate")) {
            return "Medium"; 
        } 
        return "Low";
    }

    private String extractValue(String json, String key) {
        try {
            java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("\"" + key + "\"\\s*:\\s*\"(.*?)(?<!\\\\)\"")
                .matcher(json);
            
            if (matcher.find()) {
                return matcher.group(1)
                    .replace("\\\"", "\"")
                    .replace("\\n", "\n");
            }
        } catch (Exception e) { 
            return "N/A"; 
        }
        return "N/A";
    }
}
