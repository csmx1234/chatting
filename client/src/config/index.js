export default {
    TEST: true,
    dev: false,
    http: 'http',
    dev_url: "192.168.0.38",
    prod_url: "45.32.65.216",
    port: "1234",
    api_addr: "/api/v1",
    FEMALE: 0,
    MALE: 1,
    RANDOM: 2,
    gendToStr: function (gender) {
        if (gender == 0) {
            return "FEMALE";
        } else if (gender == 1) {
            return "MALE";
        } else if (gender == 2) {
            return "RANDOM";
        }
    },
};
