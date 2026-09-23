package com.rutaia.dto;

import java.math.BigDecimal;

public class UmbralConfigDTO {
    private Double porcentaje;
    private BigDecimal valorDecimal;
    private String etiqueta;

    public UmbralConfigDTO() {
    }

    public UmbralConfigDTO(Double porcentaje, BigDecimal valorDecimal, String etiqueta) {
        this.porcentaje = porcentaje;
        this.valorDecimal = valorDecimal;
        this.etiqueta = etiqueta;
    }

    public Double getPorcentaje() {
        return porcentaje;
    }

    public void setPorcentaje(Double porcentaje) {
        this.porcentaje = porcentaje;
    }

    public BigDecimal getValorDecimal() {
        return valorDecimal;
    }

    public void setValorDecimal(BigDecimal valorDecimal) {
        this.valorDecimal = valorDecimal;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }
}
