package com.rutaia.dto;

import java.util.List;
import java.util.ArrayList;

public class EstadisticasAdminDTO {
    private long totalUsuarios;
    private long usuariosActivos;
    private long totalConsultas;
    private long consultasRespondidas;
    private long consultasSinResultados;
    private long consultasError;
    private Double promedioCalificaciones;
    private String cursoMasRecomendado;
    private List<String> topCursosRecomendados = new ArrayList<>();
    private List<AccionUsuarioDTO> accionesPorUsuario;
    private List<AccionDiaDTO> accionesPorDia;
    private List<AuditoriaDTO> auditoria;

    public EstadisticasAdminDTO() {
    }

    public EstadisticasAdminDTO(long totalUsuarios, long usuariosActivos, long totalConsultas, long consultasRespondidas, long consultasSinResultados, long consultasError, Double promedioCalificaciones, String cursoMasRecomendado, List<AccionUsuarioDTO> accionesPorUsuario, List<AccionDiaDTO> accionesPorDia, List<AuditoriaDTO> auditoria) {
        this.totalUsuarios = totalUsuarios;
        this.usuariosActivos = usuariosActivos;
        this.totalConsultas = totalConsultas;
        this.consultasRespondidas = consultasRespondidas;
        this.consultasSinResultados = consultasSinResultados;
        this.consultasError = consultasError;
        this.promedioCalificaciones = promedioCalificaciones;
        this.cursoMasRecomendado = cursoMasRecomendado;
        this.accionesPorUsuario = accionesPorUsuario;
        this.accionesPorDia = accionesPorDia;
        this.auditoria = auditoria;
    }

    public long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public long getUsuariosActivos() {
        return usuariosActivos;
    }

    public void setUsuariosActivos(long usuariosActivos) {
        this.usuariosActivos = usuariosActivos;
    }

    public long getTotalConsultas() {
        return totalConsultas;
    }

    public void setTotalConsultas(long totalConsultas) {
        this.totalConsultas = totalConsultas;
    }

    public long getConsultasRespondidas() {
        return consultasRespondidas;
    }

    public void setConsultasRespondidas(long consultasRespondidas) {
        this.consultasRespondidas = consultasRespondidas;
    }

    public long getConsultasSinResultados() {
        return consultasSinResultados;
    }

    public void setConsultasSinResultados(long consultasSinResultados) {
        this.consultasSinResultados = consultasSinResultados;
    }

    public long getConsultasError() {
        return consultasError;
    }

    public void setConsultasError(long consultasError) {
        this.consultasError = consultasError;
    }

    public Double getPromedioCalificaciones() {
        return promedioCalificaciones;
    }

    public void setPromedioCalificaciones(Double promedioCalificaciones) {
        this.promedioCalificaciones = promedioCalificaciones;
    }

    public String getCursoMasRecomendado() {
        return cursoMasRecomendado;
    }

    public void setCursoMasRecomendado(String cursoMasRecomendado) {
        this.cursoMasRecomendado = cursoMasRecomendado;
    }

    public List<AccionUsuarioDTO> getAccionesPorUsuario() {
        return accionesPorUsuario;
    }

    public void setAccionesPorUsuario(List<AccionUsuarioDTO> accionesPorUsuario) {
        this.accionesPorUsuario = accionesPorUsuario;
    }

    public List<AccionDiaDTO> getAccionesPorDia() {
        return accionesPorDia;
    }

    public void setAccionesPorDia(List<AccionDiaDTO> accionesPorDia) {
        this.accionesPorDia = accionesPorDia;
    }

    public List<AuditoriaDTO> getAuditoria() {
        return auditoria;
    }

    public void setAuditoria(List<AuditoriaDTO> auditoria) {
        this.auditoria = auditoria;
    }

    public List<String> getTopCursosRecomendados() {
        return topCursosRecomendados;
    }

    public void setTopCursosRecomendados(List<String> topCursosRecomendados) {
        this.topCursosRecomendados = topCursosRecomendados;
    }
}
