package com.qlthietbi.controller;

import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.ThongBaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<ThongBao> markAsRead(@PathVariable Integer id) {
        Optional<ThongBao> opt = thongBaoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ThongBao tb = opt.get();
        tb.setDaDoc(true);
        return ResponseEntity.ok(thongBaoRepository.save(tb));
    }

    @PutMapping("/mark-all-read")
    @Transactional
    public ResponseEntity<Void> markAllRead() {
        thongBaoRepository.markAllRead();
        return ResponseEntity.ok().build();
    }
}
