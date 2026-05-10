package com.flyte.backend.DTO.Config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppConfigResponse {
    private String helpAndSupportContent;
    private String privacyAndSecurityContent;
}
