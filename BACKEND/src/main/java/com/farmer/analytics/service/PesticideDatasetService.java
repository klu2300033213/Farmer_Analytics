package com.farmer.analytics.service;

import com.farmer.analytics.model.PesticideImportLog;
import com.farmer.analytics.model.PesticideProduct;
import com.farmer.analytics.repository.PesticideImportLogRepository;
import com.farmer.analytics.repository.PesticideProductRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class PesticideDatasetService {

    private final PesticideProductRepository productRepository;
    private final PesticideImportLogRepository importLogRepository;

    public PesticideDatasetService(PesticideProductRepository productRepository,
                                   PesticideImportLogRepository importLogRepository) {
        this.productRepository = productRepository;
        this.importLogRepository = importLogRepository;
    }

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("csv", "pdf", "doc", "docx");

    public Map<String, Object> importDataset(MultipartFile file,
                                             String sourceSection,
                                             Integer sourceYear,
                                             String sourceDate) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dataset file is required");
        }

        String fileName = file.getOriginalFilename() == null ? "upload.csv" : file.getOriginalFilename();
        String extension = extensionOf(fileName);
        if (!SUPPORTED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Please upload CSV, PDF, DOC, or DOCX files only");
        }

        int totalRows = 0;
        int insertedRows = 0;
        int updatedRows = 0;
        int skippedRows = 0;

        String importMode = extension.equals("csv") ? "CSV" : "DOCUMENT";
        String notes = "";

        if ("csv".equals(extension)) {
            CsvImportResult csvResult = importFromCsv(file, sourceSection, sourceYear, sourceDate);
            totalRows = csvResult.totalRows();
            insertedRows = csvResult.insertedRows();
            updatedRows = csvResult.updatedRows();
            skippedRows = csvResult.skippedRows();
            notes = "CSV import completed";
        } else {
            DocumentImportResult docResult = importFromDocument(file, extension, sourceSection, sourceYear, sourceDate);
            totalRows = docResult.totalRows();
            insertedRows = docResult.insertedRows();
            updatedRows = docResult.updatedRows();
            skippedRows = docResult.skippedRows();
            notes = docResult.notes();
        }

        PesticideImportLog log = new PesticideImportLog();
        log.setSourceSection(isBlank(sourceSection) ? "Registered Products" : sourceSection.trim());
        log.setFileName(fileName);
        log.setTotalRows(totalRows);
        log.setInsertedRows(insertedRows);
        log.setUpdatedRows(updatedRows);
        log.setSkippedRows(skippedRows);
        log.setNotes(notes);
        log.setCreatedAt(LocalDateTime.now());
        importLogRepository.save(log);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("fileName", fileName);
        summary.put("sourceSection", log.getSourceSection());
        summary.put("importMode", importMode);
        summary.put("totalRows", totalRows);
        summary.put("insertedRows", insertedRows);
        summary.put("updatedRows", updatedRows);
        summary.put("skippedRows", skippedRows);
        summary.put("totalProducts", productRepository.count());
        summary.put("notes", notes);
        return summary;
    }

    public Map<String, Object> importCsv(MultipartFile file,
                                         String sourceSection,
                                         Integer sourceYear,
                                         String sourceDate) {
        return importDataset(file, sourceSection, sourceYear, sourceDate);
    }

    public Map<String, Object> previewDataset(MultipartFile file,
                                              String sourceSection,
                                              Integer sourceYear,
                                              String sourceDate) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dataset file is required");
        }

        String fileName = file.getOriginalFilename() == null ? "upload.csv" : file.getOriginalFilename();
        String extension = extensionOf(fileName);
        if (!SUPPORTED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Please upload CSV, PDF, DOC, or DOCX files only");
        }

        String normalizedSection = isBlank(sourceSection) ? "Registered Products" : sourceSection.trim();
        List<PreviewCandidate> candidates = "csv".equals(extension)
                ? previewFromCsv(file, sourceYear, sourceDate)
                : previewFromDocument(file, extension, sourceYear, sourceDate);

        long recommendedRows = candidates.stream()
                .filter(candidate -> isFarmerSafeCandidate(candidate, normalizedSection))
                .count();

        List<Map<String, Object>> previewRows = candidates.stream()
                .limit(40)
                .map(candidate -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("registrationNumber", candidate.registrationNumber());
                    row.put("productName", candidate.productName());
                    row.put("activeIngredient", candidate.activeIngredient());
                    row.put("formulation", candidate.formulation());
                    row.put("legalStatus", candidate.legalStatus());
                    row.put("quality", isFarmerSafeCandidate(candidate, normalizedSection) ? "GOOD" : "LOW");
                    return row;
                })
                .toList();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("fileName", fileName);
        out.put("sourceSection", normalizedSection);
        out.put("sourceYear", sourceYear);
        out.put("sourceDate", isBlank(sourceDate) ? "" : sourceDate.trim());
        out.put("importMode", "csv".equals(extension) ? "CSV" : "DOCUMENT");
        out.put("totalParsedRows", candidates.size());
        out.put("recommendedRows", recommendedRows);
        out.put("previewRows", previewRows);
        out.put("notes", "Preview only. No rows saved yet.");
        return out;
    }

    private List<PreviewCandidate> previewFromCsv(MultipartFile file,
                                                  Integer sourceYear,
                                                  String sourceDate) {
        List<PreviewCandidate> out = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            Map<String, String> headerLookup = new LinkedHashMap<>();
            for (String h : parser.getHeaderNames()) {
                headerLookup.put(normalize(h), h);
            }

            for (CSVRecord row : parser) {
                PreviewCandidate candidate = buildCandidate(
                        value(row, headerLookup, "productname", "product", "name", "nameofproduct", "pesticidename"),
                        value(row, headerLookup, "registrationnumber", "regnumber", "regno", "registrationno", "registration"),
                        value(row, headerLookup, "activeingredient", "active", "ingredient", "activeconstituent"),
                        value(row, headerLookup, "formulation", "formulationtype", "type"),
                        value(row, headerLookup, "concentration", "strength", "percent", "percentage"),
                    value(row, headerLookup, "priceperunit", "price", "mrp", "cost", "costperunit", "rate"),
                        value(row, headerLookup, "approvedcrops", "crop", "crops", "cropname", "approvedcrop"),
                        value(row, headerLookup, "targetpests", "pest", "pests", "targetdisease", "target"),
                        value(row, headerLookup, "registrantcompany", "company", "manufacturer", "registrant"),
                        value(row, headerLookup, "legalstatus", "status", "registrationstatus"),
                        sourceYear,
                        sourceDate
                );
                if (candidate != null) {
                    out.add(candidate);
                }
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse CSV: " + ex.getMessage(), ex);
        }

        return out;
    }

    private List<PreviewCandidate> previewFromDocument(MultipartFile file,
                                                       String extension,
                                                       Integer sourceYear,
                                                       String sourceDate) {
        String text;
        try {
            text = extractText(file, extension);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to read document: " + ex.getMessage(), ex);
        }

        List<String> lines = text.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();

        List<PreviewCandidate> out = new ArrayList<>();
        int headerIndex = detectHeaderIndex(lines);

        if (headerIndex >= 0) {
            List<String> headerColumns = splitSmart(lines.get(headerIndex));
            Map<String, Integer> headerLookup = new HashMap<>();
            for (int i = 0; i < headerColumns.size(); i++) {
                headerLookup.put(normalize(headerColumns.get(i)), i);
            }

            for (int i = headerIndex + 1; i < lines.size(); i++) {
                List<String> cols = splitSmart(lines.get(i));
                if (cols.size() < 2) continue;

                PreviewCandidate candidate = buildCandidate(
                        pick(cols, headerLookup, "productname", "product", "name", "nameofproduct", "pesticidename"),
                        pick(cols, headerLookup, "registrationnumber", "regnumber", "regno", "registrationno", "registration"),
                        pick(cols, headerLookup, "activeingredient", "active", "ingredient", "activeconstituent"),
                        pick(cols, headerLookup, "formulation", "formulationtype", "type"),
                        pick(cols, headerLookup, "concentration", "strength", "percent", "percentage"),
                    pick(cols, headerLookup, "priceperunit", "price", "mrp", "cost", "costperunit", "rate"),
                        pick(cols, headerLookup, "approvedcrops", "crop", "crops", "cropname", "approvedcrop"),
                        pick(cols, headerLookup, "targetpests", "pest", "pests", "targetdisease", "target"),
                        pick(cols, headerLookup, "registrantcompany", "company", "manufacturer", "registrant"),
                        pick(cols, headerLookup, "legalstatus", "status", "registrationstatus"),
                        sourceYear,
                        sourceDate
                );

                if (candidate != null) {
                    out.add(candidate);
                }
            }
        } else {
            for (String line : lines) {
                List<String> cols = splitSmart(line);
                if (cols.size() < 2) continue;

                String first = cols.get(0);
                String second = cols.size() > 1 ? cols.get(1) : "";
                String productName;
                String registrationNumber;
                if (looksLikeRegistration(first) && !isBlank(second)) {
                    registrationNumber = first;
                    productName = second;
                } else {
                    registrationNumber = "NA-" + Math.abs((first + second).toLowerCase(Locale.ROOT).hashCode());
                    productName = first;
                }

                PreviewCandidate candidate = buildCandidate(
                        productName,
                        registrationNumber,
                        getAt(cols, 2),
                        getAt(cols, 3),
                        "",
                    "",
                        getAt(cols, 4),
                        getAt(cols, 5),
                        getAt(cols, 6),
                        "",
                        sourceYear,
                        sourceDate
                );

                if (candidate != null) {
                    out.add(candidate);
                }
            }
        }

        return out;
    }

    private CsvImportResult importFromCsv(MultipartFile file,
                                          String sourceSection,
                                          Integer sourceYear,
                                          String sourceDate) {
        int totalRows = 0;
        int insertedRows = 0;
        int updatedRows = 0;
        int skippedRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            Map<String, String> headerLookup = new LinkedHashMap<>();
            for (String h : parser.getHeaderNames()) {
                headerLookup.put(normalize(h), h);
            }

            for (CSVRecord row : parser) {
                totalRows++;

                UpsertOutcome outcome = upsertRow(
                        value(row, headerLookup, "productname", "product", "name", "nameofproduct", "pesticidename"),
                        value(row, headerLookup, "registrationnumber", "regnumber", "regno", "registrationno", "registration"),
                        value(row, headerLookup, "activeingredient", "active", "ingredient", "activeconstituent"),
                        value(row, headerLookup, "formulation", "formulationtype", "type"),
                        value(row, headerLookup, "concentration", "strength", "percent", "percentage"),
                    value(row, headerLookup, "priceperunit", "price", "mrp", "cost", "costperunit", "rate"),
                        value(row, headerLookup, "approvedcrops", "crop", "crops", "cropname", "approvedcrop"),
                        value(row, headerLookup, "targetpests", "pest", "pests", "targetdisease", "target"),
                        value(row, headerLookup, "registrantcompany", "company", "manufacturer", "registrant"),
                        value(row, headerLookup, "legalstatus", "status", "registrationstatus"),
                        sourceSection,
                        sourceYear,
                        sourceDate
                );

                if (outcome == UpsertOutcome.SKIPPED) skippedRows++;
                else if (outcome == UpsertOutcome.INSERTED) insertedRows++;
                else updatedRows++;
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse CSV: " + ex.getMessage(), ex);
        }

        return new CsvImportResult(totalRows, insertedRows, updatedRows, skippedRows);
    }

    private DocumentImportResult importFromDocument(MultipartFile file,
                                                    String extension,
                                                    String sourceSection,
                                                    Integer sourceYear,
                                                    String sourceDate) {
        String text;
        try {
            text = extractText(file, extension);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to read document: " + ex.getMessage(), ex);
        }

        List<String> lines = text.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();

        int totalRows = 0;
        int insertedRows = 0;
        int updatedRows = 0;
        int skippedRows = 0;
        int headerIndex = detectHeaderIndex(lines);

        if (headerIndex >= 0) {
            List<String> headerColumns = splitSmart(lines.get(headerIndex));
            Map<String, Integer> headerLookup = new HashMap<>();
            for (int i = 0; i < headerColumns.size(); i++) {
                headerLookup.put(normalize(headerColumns.get(i)), i);
            }

            for (int i = headerIndex + 1; i < lines.size(); i++) {
                List<String> cols = splitSmart(lines.get(i));
                if (cols.size() < 2) continue;
                totalRows++;

                UpsertOutcome outcome = upsertRow(
                        pick(cols, headerLookup, "productname", "product", "name", "nameofproduct", "pesticidename"),
                        pick(cols, headerLookup, "registrationnumber", "regnumber", "regno", "registrationno", "registration"),
                        pick(cols, headerLookup, "activeingredient", "active", "ingredient", "activeconstituent"),
                        pick(cols, headerLookup, "formulation", "formulationtype", "type"),
                        pick(cols, headerLookup, "concentration", "strength", "percent", "percentage"),
                    pick(cols, headerLookup, "priceperunit", "price", "mrp", "cost", "costperunit", "rate"),
                        pick(cols, headerLookup, "approvedcrops", "crop", "crops", "cropname", "approvedcrop"),
                        pick(cols, headerLookup, "targetpests", "pest", "pests", "targetdisease", "target"),
                        pick(cols, headerLookup, "registrantcompany", "company", "manufacturer", "registrant"),
                        pick(cols, headerLookup, "legalstatus", "status", "registrationstatus"),
                        sourceSection,
                        sourceYear,
                        sourceDate
                );

                if (outcome == UpsertOutcome.SKIPPED) skippedRows++;
                else if (outcome == UpsertOutcome.INSERTED) insertedRows++;
                else updatedRows++;
            }
        } else {
            for (String line : lines) {
                List<String> cols = splitSmart(line);
                if (cols.size() < 2) continue;
                totalRows++;

                String first = cols.get(0);
                String second = cols.size() > 1 ? cols.get(1) : "";

                String productName;
                String registrationNumber;
                if (looksLikeRegistration(first) && !isBlank(second)) {
                    registrationNumber = first;
                    productName = second;
                } else {
                    registrationNumber = "NA-" + Math.abs((first + second + Instant.now().toEpochMilli()).toLowerCase(Locale.ROOT).hashCode());
                    productName = first;
                }

                UpsertOutcome outcome = upsertRow(
                        productName,
                        registrationNumber,
                        getAt(cols, 2),
                        getAt(cols, 3),
                        "",
                    "",
                        getAt(cols, 4),
                        getAt(cols, 5),
                        getAt(cols, 6),
                        "",
                        sourceSection,
                        sourceYear,
                        sourceDate
                );

                if (outcome == UpsertOutcome.SKIPPED) skippedRows++;
                else if (outcome == UpsertOutcome.INSERTED) insertedRows++;
                else updatedRows++;
            }
        }

        String notes = "Document import completed from " + extension.toUpperCase(Locale.ROOT)
                + " using table-text heuristics";
        return new DocumentImportResult(totalRows, insertedRows, updatedRows, skippedRows, notes);
    }

    private String extractText(MultipartFile file, String extension) throws Exception {
        if ("pdf".equals(extension)) {
            try (PDDocument doc = PDDocument.load(file.getInputStream())) {
                return new PDFTextStripper().getText(doc);
            }
        }

        if ("docx".equals(extension)) {
            StringBuilder out = new StringBuilder();
            try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                for (XWPFTable table : doc.getTables()) {
                    for (XWPFTableRow row : table.getRows()) {
                        List<String> cells = new ArrayList<>();
                        for (XWPFTableCell cell : row.getTableCells()) {
                            cells.add(clean(cell.getText()));
                        }
                        out.append(String.join("\t", cells)).append("\n");
                    }
                }

                if (out.length() == 0) {
                    doc.getParagraphs().forEach(p -> out.append(clean(p.getText())).append("\n"));
                }
            }
            return out.toString();
        }

        if ("doc".equals(extension)) {
            try (HWPFDocument doc = new HWPFDocument(file.getInputStream());
                 WordExtractor extractor = new WordExtractor(doc)) {
                return extractor.getText();
            }
        }

        return "";
    }

    private int detectHeaderIndex(List<String> lines) {
        int scanLimit = Math.min(lines.size(), 60);
        for (int i = 0; i < scanLimit; i++) {
            String normalized = normalize(lines.get(i));
            if (normalized.contains("product") && (normalized.contains("registration") || normalized.contains("regno"))) {
                return i;
            }
        }
        return -1;
    }

    private List<String> splitSmart(String line) {
        if (line == null) return List.of();
        String value = line.trim();
        if (value.isEmpty()) return List.of();

        if (value.contains("\t")) {
            return splitAndTrim(value.split("\\t"));
        }
        if (value.contains("|")) {
            return splitAndTrim(value.split("\\|"));
        }
        if (value.contains(",")) {
            try {
                CSVParser parser = CSVParser.parse(value, CSVFormat.DEFAULT.builder().setTrim(true).build());
                if (!parser.getRecords().isEmpty()) {
                    List<String> cols = new ArrayList<>();
                    CSVRecord record = parser.getRecords().get(0);
                    record.forEach(cols::add);
                    return cols;
                }
            } catch (Exception ignored) {
                // Fall through to whitespace split when inline CSV parsing fails.
            }
        }
        return splitAndTrim(value.split("\\s{2,}"));
    }

    private List<String> splitAndTrim(String[] parts) {
        List<String> out = new ArrayList<>();
        for (String p : parts) {
            String c = clean(p);
            if (!c.isEmpty()) out.add(c);
        }
        return out;
    }

    private String pick(List<String> cols, Map<String, Integer> headerLookup, String... aliases) {
        for (String alias : aliases) {
            Integer idx = headerLookup.get(normalize(alias));
            if (idx != null && idx >= 0 && idx < cols.size()) {
                return cols.get(idx);
            }
        }
        return "";
    }

    private String getAt(List<String> cols, int idx) {
        if (idx < 0 || idx >= cols.size()) return "";
        return cols.get(idx);
    }

    private boolean looksLikeRegistration(String value) {
        if (isBlank(value)) return false;
        String v = value.toLowerCase(Locale.ROOT);
        return v.contains("/") || v.contains("cib") || v.contains("rc") || v.matches(".*\\d.*");
    }

    private String extensionOf(String fileName) {
        int idx = fileName.lastIndexOf('.');
        if (idx < 0 || idx == fileName.length() - 1) return "";
        return fileName.substring(idx + 1).toLowerCase(Locale.ROOT);
    }

    private UpsertOutcome upsertRow(String productName,
                                    String registrationNumber,
                                    String activeIngredient,
                                    String formulation,
                                    String concentration,
                                    String pricePerUnit,
                                    String approvedCrops,
                                    String targetPests,
                                    String registrantCompany,
                                    String legalStatus,
                                    String sourceSection,
                                    Integer sourceYear,
                                    String sourceDate) {
        if (isBlank(productName)) {
            return UpsertOutcome.SKIPPED;
        }

        if (isBlank(registrationNumber)) {
            registrationNumber = "NA-" + Math.abs(productName.toLowerCase(Locale.ROOT).hashCode());
        }

        PesticideProduct entity = productRepository
                .findFirstByRegistrationNumberIgnoreCaseAndProductNameIgnoreCase(registrationNumber, productName)
                .orElseGet(PesticideProduct::new);

        boolean isInsert = entity.getId() == null;

        entity.setRegistrationNumber(clean(registrationNumber));
        entity.setProductName(clean(productName));
        entity.setActiveIngredient(clean(activeIngredient));
        entity.setFormulation(clean(formulation));
        entity.setConcentration(clean(concentration));
        entity.setPricePerUnit(parsePrice(pricePerUnit));
        entity.setApprovedCrops(clean(approvedCrops));
        entity.setTargetPests(clean(targetPests));
        entity.setRegistrantCompany(clean(registrantCompany));

        String normalizedStatus = clean(legalStatus);
        entity.setLegalStatus(isBlank(normalizedStatus) ? "REGISTERED" : normalizedStatus.toUpperCase(Locale.ROOT));
        entity.setSourceSection(isBlank(sourceSection) ? "Registered Products" : sourceSection.trim());
        entity.setSourceYear(sourceYear);
        entity.setSourceDate(isBlank(sourceDate) ? "" : sourceDate.trim());
        entity.setLastImportedAt(LocalDateTime.now());

        productRepository.save(entity);
        return isInsert ? UpsertOutcome.INSERTED : UpsertOutcome.UPDATED;
    }

    private PreviewCandidate buildCandidate(String productName,
                                            String registrationNumber,
                                            String activeIngredient,
                                            String formulation,
                                            String concentration,
                                            String pricePerUnit,
                                            String approvedCrops,
                                            String targetPests,
                                            String registrantCompany,
                                            String legalStatus,
                                            Integer sourceYear,
                                            String sourceDate) {
        String safeName = clean(productName);
        if (isBlank(safeName)) { 
            return null;
        }

        String safeReg = clean(registrationNumber);
        if (isBlank(safeReg)) {
            safeReg = "NA-" + Math.abs(safeName.toLowerCase(Locale.ROOT).hashCode());
        }

        String safeStatus = clean(legalStatus);
        if (isBlank(safeStatus)) {
            safeStatus = "REGISTERED";
        }

        return new PreviewCandidate(
                safeReg,
                safeName,
                clean(activeIngredient),
                clean(formulation),
                clean(concentration),
                parsePrice(pricePerUnit),
                clean(approvedCrops),
                clean(targetPests),
                clean(registrantCompany),
                safeStatus.toUpperCase(Locale.ROOT),
                sourceYear,
                isBlank(sourceDate) ? "" : sourceDate.trim()
        );
    }

    private enum UpsertOutcome {
        INSERTED,
        UPDATED,
        SKIPPED
    }

    private record CsvImportResult(int totalRows, int insertedRows, int updatedRows, int skippedRows) {}

    private record DocumentImportResult(int totalRows, int insertedRows, int updatedRows, int skippedRows, String notes) {}

        private record PreviewCandidate(
            String registrationNumber,
            String productName,
            String activeIngredient,
            String formulation,
            String concentration,
            Double pricePerUnit,
            String approvedCrops,
            String targetPests,
            String registrantCompany,
            String legalStatus,
            Integer sourceYear,
            String sourceDate
        ) {}

    public List<Map<String, Object>> findProducts(String query, String crop, String pest, String status, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return productRepository.search(
                        blankToNull(query),
                        blankToNull(crop),
                        blankToNull(pest),
                        blankToNull(status)
                ).stream()
                .filter(this::isFarmerSafeRow)
                .limit(safeLimit)
                .map(this::toRow)
                .toList();
    }

    public Map<String, Object> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        List<PesticideProduct> allProducts = productRepository.findAll();
        out.put("totalProducts", allProducts.size());
        out.put("usableProducts", allProducts.stream().filter(this::isFarmerSafeRow).count());
        out.put("registeredProducts", productRepository.countByLegalStatusIgnoreCase("REGISTERED"));
        out.put("restrictedProducts", productRepository.countByLegalStatusIgnoreCase("RESTRICTED"));
        out.put("bannedProducts", productRepository.countByLegalStatusIgnoreCase("BANNED"));
        out.put("recentImports", importLogRepository.findTop20ByOrderByCreatedAtDesc().stream().limit(5).map(log -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fileName", log.getFileName());
            row.put("sourceSection", log.getSourceSection());
            row.put("totalRows", log.getTotalRows());
            row.put("insertedRows", log.getInsertedRows());
            row.put("updatedRows", log.getUpdatedRows());
            row.put("createdAt", String.valueOf(log.getCreatedAt()));
            return row;
        }).toList());
        return out;
    }

    public List<Map<String, Object>> recentImportLogs() {
        return importLogRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(log -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", log.getId());
                    row.put("fileName", log.getFileName());
                    row.put("sourceSection", log.getSourceSection());
                    row.put("totalRows", log.getTotalRows());
                    row.put("insertedRows", log.getInsertedRows());
                    row.put("updatedRows", log.getUpdatedRows());
                    row.put("skippedRows", log.getSkippedRows());
                    row.put("notes", log.getNotes());
                    row.put("createdAt", String.valueOf(log.getCreatedAt()));
                    return row;
                })
                .toList();
    }

    private Map<String, Object> toRow(PesticideProduct p) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", p.getId());
        row.put("registrationNumber", empty(p.getRegistrationNumber()));
        row.put("productName", empty(p.getProductName()));
        row.put("activeIngredient", empty(p.getActiveIngredient()));
        row.put("formulation", empty(p.getFormulation()));
        row.put("concentration", empty(p.getConcentration()));
        row.put("pricePerUnit", p.getPricePerUnit());
        row.put("approvedCrops", empty(p.getApprovedCrops()));
        row.put("targetPests", empty(p.getTargetPests()));
        row.put("registrantCompany", empty(p.getRegistrantCompany()));
        row.put("legalStatus", empty(p.getLegalStatus()));
        row.put("sourceSection", empty(p.getSourceSection()));
        row.put("sourceYear", p.getSourceYear());
        row.put("sourceDate", empty(p.getSourceDate()));
        row.put("lastImportedAt", String.valueOf(p.getLastImportedAt()));
        return row;
    }

    private String value(CSVRecord row, Map<String, String> lookup, String... aliases) {
        for (String alias : aliases) {
            String actualHeader = lookup.get(normalize(alias));
            if (actualHeader != null && row.isMapped(actualHeader)) {
                return row.get(actualHeader);
            }
        }
        return "";
    }

    private Double parsePrice(String rawPrice) {
        if (isBlank(rawPrice)) return null;
        String normalized = rawPrice
                .replaceAll("[^0-9.,]", "")
                .replaceAll(",", "")
                .trim();
        if (normalized.isEmpty()) return null;
        try {
            return Double.parseDouble(normalized);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private String clean(String s) {
        if (s == null) return "";
        return s.trim();
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String blankToNull(String s) {
        return isBlank(s) ? null : s.trim();
    }

    private String empty(String s) {
        return s == null ? "" : s;
    }

    private boolean isFarmerSafeRow(PesticideProduct p) {
        String section = empty(p.getSourceSection()).toLowerCase(Locale.ROOT);
        if (section.contains("news") || section.contains("schedule")) {
            return false;
        }

        String name = empty(p.getProductName()).trim();
        if (name.length() < 4) {
            return false;
        }

        int letters = 0;
        int digits = 0;
        for (char c : name.toCharArray()) {
            if (Character.isLetter(c)) letters++;
            if (Character.isDigit(c)) digits++;
        }

        if (letters < 3) {
            return false;
        }

        if (name.matches("(?i)^\\d+(\\.\\d+)?\\s*%\\s*[a-z]{1,4}$")) {
            return false;
        }

        String reg = empty(p.getRegistrationNumber()).trim();
        boolean syntheticReg = reg.startsWith("NA-");
        boolean hasSupportingFields = !isBlank(p.getActiveIngredient())
                || !isBlank(p.getRegistrantCompany())
                || !isBlank(p.getApprovedCrops())
                || !isBlank(p.getTargetPests())
                || !isBlank(p.getFormulation());

        if (syntheticReg && !hasSupportingFields) {
            return false;
        }

        if (digits > 0 && letters <= 2) {
            return false;
        }

        return true;
    }

    private boolean isFarmerSafeCandidate(PreviewCandidate candidate, String sourceSection) {
        String section = empty(sourceSection).toLowerCase(Locale.ROOT);
        if (section.contains("news") || section.contains("schedule")) {
            return false;
        }

        String name = empty(candidate.productName()).trim();
        if (name.length() < 4) {
            return false;
        }

        int letters = 0;
        int digits = 0;
        for (char c : name.toCharArray()) {
            if (Character.isLetter(c)) letters++;
            if (Character.isDigit(c)) digits++;
        }

        if (letters < 3) {
            return false;
        }

        if (name.matches("(?i)^\\d+(\\.\\d+)?\\s*%\\s*[a-z]{1,4}$")) {
            return false;
        }

        String reg = empty(candidate.registrationNumber()).trim();
        boolean syntheticReg = reg.startsWith("NA-");
        boolean hasSupportingFields = !isBlank(candidate.activeIngredient())
                || !isBlank(candidate.registrantCompany())
                || !isBlank(candidate.approvedCrops())
                || !isBlank(candidate.targetPests())
                || !isBlank(candidate.formulation());

        if (syntheticReg && !hasSupportingFields) {
            return false;
        }

        if (digits > 0 && letters <= 2) {
            return false;
        }

        return true;
    }
}
