package com.farmer.analytics.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:5173")
public class PdfController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/download")
        public ResponseEntity<byte[]> downloadPdf(@RequestBody Map<String, Object> body) {

        // 👉 This is your Node PDF engine
        String nodeUrl = "http://localhost:5001/pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        // 👉 Call Node backend
        ResponseEntity<byte[]> response =
                restTemplate.postForEntity(nodeUrl, request, byte[].class);

        // 👉 Send PDF back to frontend
        HttpHeaders outHeaders = new HttpHeaders();
        outHeaders.setContentType(MediaType.APPLICATION_PDF);
        outHeaders.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("Farmer_Analytics_Report.pdf")
                        .build()
        );

        return new ResponseEntity<>(
                response.getBody(),
                outHeaders,
                HttpStatus.OK
        );
    }
}
