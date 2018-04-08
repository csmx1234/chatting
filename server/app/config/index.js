module.exports = {
  TEST: false,
  port: 1234,
  secret: 'lppssb0227$$',
  session: { session: false },
  token_exp: { minutes: 30 },
  database: 'mongodb://127.0.0.1:27017/serverDB',
  api_url: '/api/v1',
  redisUrl: 'redis://localhos:6379',
  FEMALE: 0,
  MALE: 1,
  RANDOM: 2,
  gendToStr: function(gender) {
    if ( gender == 0 ) {
      return "FEMALE";
    } else if ( gender == 1 ) {
      return "MALE";
    } else if ( gender == 2 ) {
      return "RANDOM";
    }
  }
}