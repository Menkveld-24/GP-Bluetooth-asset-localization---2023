#include <zephyr/device.h>
#include <zephyr/toolchain.h>

/* 1 : /soc/clock@40000000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_41[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 2 : /soc/gpio@50000000:
 * Supported:
 *    - /spk-pwr-ctrl
 *    - /vdd-pwr-ctrl
 *    - /soc/i2c@40003000/ccs811@5a
 *    - /soc/i2c@40003000/hts221@5f
 *    - /soc/i2c@40004000/lis2dh12@19
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_5[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, 6, 7, 13, 14, 15, DEVICE_HANDLE_ENDS };

/* 3 : /soc/random@4000d000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_64[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 4 : /entropy_bt_hci:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_3[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 5 : /soc/uart@40002000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_77[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 6 : /spk-pwr-ctrl:
 * Direct Dependencies:
 *    - /soc/gpio@50000000
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_15[] = { 2, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 7 : /vdd-pwr-ctrl:
 * Direct Dependencies:
 *    - /soc/gpio@50000000
 * Supported:
 *    - /soc/i2c@40003000/sx1509b@3e
 *    - /soc/i2c@40003000/hts221@5f
 *    - /soc/i2c@40003000/lps22hb_press@5c
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_6[] = { 2, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, 12, 14, 16, DEVICE_HANDLE_ENDS };

/* 8 : /soc/adc@40007000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_18[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 9 : /soc/i2c@40004000:
 * Supported:
 *    - /soc/i2c@40004000/lis2dh12@19
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_92[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, 15, DEVICE_HANDLE_ENDS };

/* 10 : /soc/i2c@40003000:
 * Supported:
 *    - /soc/i2c@40003000/sx1509b@3e
 *    - /soc/i2c@40003000/ccs811@5a
 *    - /soc/i2c@40003000/hts221@5f
 *    - /soc/i2c@40003000/lps22hb_press@5c
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_11[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, 12, 13, 14, 16, DEVICE_HANDLE_ENDS };

/* 11 : /soc/flash-controller@4001e000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_80[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 12 : /soc/i2c@40003000/sx1509b@3e:
 * Direct Dependencies:
 *    - /vdd-pwr-ctrl
 *    - /soc/i2c@40003000
 * Supported:
 *    - /soc/i2c@40003000/ccs811@5a
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_12[] = { 7, 10, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, 13, DEVICE_HANDLE_ENDS };

/* 13 : /soc/i2c@40003000/ccs811@5a:
 * Direct Dependencies:
 *    - /soc/gpio@50000000
 *    - /soc/i2c@40003000
 *    - /soc/i2c@40003000/sx1509b@3e
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_89[] = { 2, 10, 12, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 14 : /soc/i2c@40003000/hts221@5f:
 * Direct Dependencies:
 *    - /soc/gpio@50000000
 *    - /vdd-pwr-ctrl
 *    - /soc/i2c@40003000
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_90[] = { 2, 7, 10, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 15 : /soc/i2c@40004000/lis2dh12@19:
 * Direct Dependencies:
 *    - /soc/gpio@50000000
 *    - /soc/i2c@40004000
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_93[] = { 2, 9, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 16 : /soc/i2c@40003000/lps22hb_press@5c:
 * Direct Dependencies:
 *    - /vdd-pwr-ctrl
 *    - /soc/i2c@40003000
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_91[] = { 7, 10, DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };

/* 17 : /soc/temp@4000c000:
 */
const Z_DECL_ALIGN(device_handle_t) __attribute__((__section__(".__device_handles_pass2")))
__devicehdl_dts_ord_71[] = { DEVICE_HANDLE_SEP, DEVICE_HANDLE_SEP, DEVICE_HANDLE_ENDS };
