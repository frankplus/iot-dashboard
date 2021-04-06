package it.unipd.webapp.devicemanagement.service;

import it.unipd.webapp.devicemanagement.model.*;
import it.unipd.webapp.devicemanagement.repository.DeviceRepository;
import it.unipd.webapp.devicemanagement.security.TokenGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class DeviceService {
    @Autowired
    private DeviceRepository deviceRepo;

    @Autowired
    private final TokenGenerator tokenGenerator = new TokenGenerator();


    public void addDevice(Customer customer, Product product) {
        DeviceConfig deviceConfig = new DeviceConfig();
        deviceConfig.setToken(tokenGenerator.nextToken());
        deviceConfig.setUpdate_frequency(1);
        deviceConfig.setEnabled(false);
        deviceConfig.setLatitude(0);
        deviceConfig.setLongitude(0);

        DeviceStatus deviceStatus = new DeviceStatus();
        deviceStatus.setBattery((byte)100); // TODO: this will be NULL
        deviceStatus.setVersion("1.0.0");
        deviceStatus.setLast_update(new Date());

        Device device = new Device();
        device.setCustomer(customer);
        device.setConfig(deviceConfig);
        device.setDeviceStatus(deviceStatus);

        device.setProduct(product);

        deviceRepo.save(device);
    }

    public void generateNewToken(Device device) {
        DeviceConfig deviceConfig = device.getConfig();
        deviceConfig.setToken(tokenGenerator.nextToken());
        deviceRepo.save(device);
    }
}
