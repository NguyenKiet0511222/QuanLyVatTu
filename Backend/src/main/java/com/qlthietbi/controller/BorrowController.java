package com.qlthietbi.controller;

import com.qlthietbi.entity.MuonTra;
import com.qlthietbi.repository.MuonTraRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/borrows")
public class BorrowController {

    private final MuonTraRepository muonTraRepository;

    public BorrowController(MuonTraRepository muonTraRepository) {
        this.muonTraRepository = muonTraRepository;
    }

    @GetMapping
    public List<MuonTra> getAll() {
        return muonTraRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MuonTra> getById(@PathVariable Integer id) {
        return muonTraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MuonTra> create(@RequestBody MuonTra mt) {
        if (mt.getNgayMuon() == null) {
            mt.setNgayMuon(LocalDate.now());
        }
        if (mt.getStatus() == null) {
            mt.setStatus("BORROWED");
        }
        MuonTra saved = muonTraRepository.save(mt);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MuonTra> update(@PathVariable Integer id, @RequestBody MuonTra mtDetails) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MuonTra mt = optionalMt.get();
        mt.setStudentId(mtDetails.getStudentId());
        mt.setStudentName(mtDetails.getStudentName());
        mt.setPhoneNumber(mtDetails.getPhoneNumber());
        mt.setItemBorrowed(mtDetails.getItemBorrowed());
        mt.setStatus(mtDetails.getStatus());
        mt.setNgayTra(mtDetails.getNgayTra());

        return ResponseEntity.ok(muonTraRepository.save(mt));
    }

    @PutMapping("/{id}/return")
    @Transactional
    public ResponseEntity<MuonTra> markAsReturned(@PathVariable Integer id) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MuonTra mt = optionalMt.get();
        mt.setStatus("RETURNED");
        mt.setNgayTra(LocalDate.now());

        return ResponseEntity.ok(muonTraRepository.save(mt));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!muonTraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        muonTraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

