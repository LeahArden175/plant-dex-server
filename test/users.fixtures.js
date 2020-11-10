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

module.exports = {
    makeUsersArray,
}