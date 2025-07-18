# Netlist Test Files

This directory contains various netlist JSON files for testing different validation conditions and showcasing valid designs.

## Validation Error Test Files

### `test-netlist-validation-errors.json`
Tests multiple basic validation errors:
- Component with blank name
- Component with blank type  
- Component with no pins
- Net with blank name
- Net with insufficient connections (only 1 connection)
- References to unknown components
- References to invalid pins

### `test-netlist-duplicate-components.json`
Tests duplicate component name detection:
- Two components with the same name "DUPLICATE_NAME"
- Missing ground and power nets

### `test-netlist-no-ground.json`
Tests missing ground net detection:
- Valid components and connections
- No GND/GROUND net present
- Should trigger "No ground net found" error

### `test-netlist-no-power.json`
Tests missing power net detection:
- Valid components and connections
- Has ground but no power net (VCC, VDD, PWR, etc.)
- Should trigger "No power net found" error

### `test-netlist-insufficient-connections.json`
Tests net connection validation:
- Valid components
- Net with only one connection (needs at least 2)
- Should trigger "insufficient connections" error

### `test-netlist-missing-ground-connections.json`
Tests components not connected to ground:
- Valid power and ground nets
- R2 component not connected to ground
- Should trigger warning about component not connected to ground
- Connectors should be exempt from this check

## Valid Sample Files

### `sample-netlist.json`
Basic valid netlist with:
- MY_IC (IC with PWR, IO1, GND)
- MY_COMP_01, MY_COMP_02 (Modules)
- MY_CONNECTOR (Connector)
- Power, ground, and signal nets

### `sample-netlist-simple-valid.json`
Simple microcontroller project:
- Microcontroller with UART and GPIO
- LED with current limiting resistor
- UART connector
- Proper power and ground distribution

### `sample-netlist-complex-valid.json`
Complex embedded system:
- Microcontroller with crystal oscillator
- I2C sensor with pullup resistors
- Multiple LEDs with PWM control
- Power supply decoupling capacitors
- External connector for programming/debugging

### `sample-netlist-power-management.json`
Power management focused design:
- Voltage regulator circuit
- SPI flash memory
- Input/output filtering capacitors
- External connectors for power and SPI
- Enable/reset control signals

### `sample-netlist-digital-system.json`
Digital processing system:
- Crystal oscillator with enable
- CPU with clock distribution
- Clock buffer for multiple clock domains
- Memory and FPGA with shared data bus
- Separate clock signals for different components

## Usage

These files can be used to:

1. **Test Validation Logic**: Load the error test files to verify that the validation system correctly identifies various types of errors.

2. **UI Testing**: Use these files to test the user interface's handling of both valid and invalid netlists.

3. **Examples**: The valid sample files serve as examples of different types of PCB designs and complexity levels.

4. **Development**: Use as test data during development to ensure changes don't break existing functionality.

## Expected Validation Results

### Error Files Should Produce:
- `test-netlist-validation-errors.json`: 7+ validation errors
- `test-netlist-duplicate-components.json`: 3+ validation errors  
- `test-netlist-no-ground.json`: 1 validation error
- `test-netlist-no-power.json`: 1 validation error
- `test-netlist-insufficient-connections.json`: 1 validation error
- `test-netlist-missing-ground-connections.json`: 1 validation warning

### Valid Files Should Produce:
- All `sample-netlist-*.json` files: 0 validation errors

## File Structure

Each netlist file follows the standard format:
```json
{
  "components": [
    {
      "name": "component_name",
      "type": "component_type", 
      "pins": ["pin1", "pin2", ...]
    }
  ],
  "nets": [
    {
      "net": "net_name",
      "connections": [
        { "component": "component_name", "pin": "pin_name" }
      ]
    }
  ]
}
```
