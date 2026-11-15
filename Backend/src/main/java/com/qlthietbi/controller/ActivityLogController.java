package com.qlthietbi.controller;

import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/activity-logs")
public class ActivityLogController {

    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public ActivityLogController(LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    @GetMapping
    public List<LichSuThaoTac> getAll() {
        return lichSuThaoTacRepository.findAllByOrderByThoiGianDesc();
    }
}
