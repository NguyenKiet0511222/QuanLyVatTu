package com.qlthietbi.controller;

import com.qlthietbi.entity.NguoiMuon;
import com.qlthietbi.repository.NguoiMuonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/nguoi-muon")
public class NguoiMuonController {

    private final NguoiMuonRepository nguoiMuonRepository;

    public NguoiMuonController(NguoiMuonRepository nguoiMuonRepository) {
        this.nguoiMuonRepository = nguoiMuonRepository;
    }

    @GetMapping
    public List<NguoiMuon> getAll() {
        return nguoiMuonRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NguoiMuon> getById(@PathVariable Integer id) {
        return nguoiMuonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<NguoiMuon> create(@RequestBody NguoiMuon nm) {
        NguoiMuon saved = nguoiMuonRepository.save(nm);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<NguoiMuon> update(@PathVariable Integer id, @RequestBody NguoiMuon nmDetails) {
        Optional<NguoiMuon> optionalNm = nguoiMuonRepository.findById(id);
        if (optionalNm.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NguoiMuon nm = optionalNm.get();
        nm.setName(nmDetails.getName());
        nm.setNgaySinh(nmDetails.getNgaySinh());
        nm.setDiaChi(nmDetails.getDiaChi());
        nm.setSoDienThoai(nmDetails.getSoDienThoai());
        nm.setEmail(nmDetails.getEmail());

        return ResponseEntity.ok(nguoiMuonRepository.save(nm));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!nguoiMuonRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        nguoiMuonRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

