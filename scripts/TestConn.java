import java.net.*;
import java.io.*;

public class TestConn {
    public static void main(String[] args) {
        String[] urls = {
            "http://127.0.0.1:5678/webhook/recomendar-cursos",
            "http://localhost:5678/webhook/recomendar-cursos"
        };
        for (String u : urls) {
            try {
                System.out.println("Testing " + u + " ...");
                long t0 = System.currentTimeMillis();
                HttpURLConnection conn = (HttpURLConnection) new URI(u).toURL().openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(15000);
                byte[] b = "{\"pregunta\":\"Quiero aprender cocina italiana.\"}".getBytes();
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(b);
                }
                int code = conn.getResponseCode();
                long t1 = System.currentTimeMillis();
                System.out.println(u + " -> HTTP " + code + " in " + (t1 - t0) + "ms");
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line = reader.readLine();
                    System.out.println("  Body: " + (line != null ? line.substring(0, Math.min(line.length(), 100)) : "empty"));
                }
            } catch (Exception e) {
                System.out.println(u + " -> ERROR: " + e);
            }
        }
    }
}
