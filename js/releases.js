function getCurrentVersion() {
    return releases[0].version;
}

function getLastUsedVersion() {
    return window.localStorage.getItem('lastUsedVersion');
}

function updateLastUsedVersion() {
    window.localStorage.setItem('lastUsedVersion', getCurrentVersion());
}

//New releases should always go at the top of this list.
var releases = [
    {
        version: 'v2.0',
        notes: [
            'Big changes'
        ]
    },
    {
        version: 'v1.2',
        notes: [
            'Another thing',
            'thing'
        ]
    },
    {
        version: 'random',
        notes: []
    },
    {
        version: 'v1.0',
        notes: [
            'Release note 1',
            'Note 2',
            'askl;jhsadfjklhasfjklhasdkjlhfa'
        ]
    }
];