module.exports = {
  // enviorment
  dev: true,
  port: 1234,
  secret: 'lppssb0227$$',
  session: { session: false },
  token_exp: { minutes: 30 },
  database: 'mongodb://127.0.0.1:27017/serverDB',
  api_url: '/api/v1',
  redisUrl: 'redis://localhos:6379',

  // socket setup
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
  },
  waiting_time: 5000,
  candidate_count: 5,
  max_candidate_count: 30
}