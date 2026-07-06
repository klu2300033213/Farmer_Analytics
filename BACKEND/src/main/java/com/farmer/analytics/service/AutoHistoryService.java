


package com.farmer.analytics.service;

import com.farmer.analytics.model.CropPrice;
import com.farmer.analytics.model.MarketPriceLive;
import com.farmer.analytics.repository.CropPriceRepository;
import com.farmer.analytics.repository.MarketPriceLiveRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AutoHistoryService {

    private final MarketPriceLiveRepository liveRepo;
    private final CropPriceRepository cropRepo;

    public AutoHistoryService(
            MarketPriceLiveRepository liveRepo,
            CropPriceRepository cropRepo
    ) {
        this.liveRepo = liveRepo;
        this.cropRepo = cropRepo;
    }

    // ⏰ Called by Scheduler
    public void generateHistory() {

        LocalDate today = LocalDate.now();

        // 🔐 (kept – no removal)
        List<CropPrice> existing =
                cropRepo.findByCropNameIgnoreCase("DUMMY");

        List<MarketPriceLive> todayPrices =
                liveRepo.findByPriceDate(today);

        if (todayPrices.isEmpty()) {
            System.out.println("⚠ No live prices to convert today");
            return;
        }

        for (MarketPriceLive mp : todayPrices) {

            // ✅ REAL duplicate protection
            boolean alreadyExists =
                    cropRepo.existsByCropNameAndYearAndMonth(
                            mp.getCropName(),
                            today.getYear(),
                            today.getMonth().name()
                    );

            if (alreadyExists) continue;

            // ✅ Save only MODAL PRICE (market reality)
            CropPrice cp = new CropPrice();
            cp.setCropName(mp.getCropName());
            cp.setPrice(mp.getModalPrice());
            cp.setYear(today.getYear());
            cp.setMonth(today.getMonth().name());
            cp.setSeason(getSeason(today.getMonthValue()));
            cp.setLocation(mp.getDistrict());

            cropRepo.save(cp);
        }

        System.out.println("✅ Auto history generated from live mandi prices");
    }

    private String getSeason(int month) {
        if (month <= 3) return "RABI";
        if (month <= 6) return "SUMMER";
        if (month <= 9) return "KHARIF";
        return "POST-KHARIF";
    }
}
