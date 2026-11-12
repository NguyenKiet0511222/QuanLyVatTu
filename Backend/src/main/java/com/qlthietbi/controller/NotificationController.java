package com.qlthietbi.controller;

import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.ThongBaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final ThongBaoRepository thongBaoRepository;

    public NotificationController(ThongBaoRepository thongBaoRepository) {
        this.thongBaoRepository = thongBaoRepository;
    }

    @GetMapping
    public List<ThongBao> getAll() {
        return thongBaoRepository.findAllByOrderByThoiGianDesc();
    }

    @PutMapping("/mark-all-read")
    @Transactional
    public ResponseEntity<Void> markAllRead() {
        thongBaoRepository.markAllRead();
        return ResponseEntity.ok().build();
    }
}

