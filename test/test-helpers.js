const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


function makePlantInfoArray() {
    return [
   {
     "id": 1,
     "nickname": 'UFO Plant',
     "scientificname": 'Pilea Peperomiodes',
     "datepurchased": '2020-01-22T00:00:00.000Z',
     "purchaseplace": 'Father Natures',
     "user_id": 1
   },
   {
     "id": 2,
     "nickname": 'Musaica',
     "scientificname": 'Calathea Musaica',
     "datepurchased": '2020-01-22T00:00:00.000Z',
     "purchaseplace": 'Plant Vine',
     "user_id": 1
   },
   {
    "id": 3,
    "nickname": 'Monstera',
    "scientificname": 'Monstera Deliciosa',
    "datepurchased": '2020-01-22T00:00:00.000Z',
    "purchaseplace": 'Plant Vine',
    "user_id": 1
   }
 ]
}
function makeUsersArray () {
    return [
        {
            username: 'dunder',
            full_name: 'Dunder Mifflin',
            nickname: null,
            password: 'password' 
        },
        {
            username: 'leah',
            full_name: 'Leah Arden',
            nickname: 'leah',
            password: 'paswsword'
        },
        {
            username: 'scoops',
            full_name: 'Nick Dardaris',
            nickname: 'scoops',
            password: 'paswsword'
        }
    ]
}
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    console.log(process.env.JWT_SECRET)
    const token = jwt.sign({ user_id: user.id}, secret, {
      subject: user.username,
      algorithm: 'HS256'
    })
    return `Bearer ${token}`
  }
  function makeMaliciousPlant() {
    const maliciousPlant = {
      id: 911,
      purchaseplace: 'Test Nickname',
      datepurchased: new Date().toISOString(),
      scientificname: 'Naughty naughty very naughty <script>alert("xss");</script>',
      nickname: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      user_id: 1
    }
    const expectedPlant = {
      ...maliciousPlant,
      scientificname: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      nickname: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousPlant,
      expectedPlant,
    }
  }


module.exports = {
    makePlantInfoArray,
    makeUsersArray,
    makeAuthHeader,
    makeMaliciousPlant,
}