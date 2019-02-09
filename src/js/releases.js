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
        version: 'v1.2',
        notes: [
            '<em>&lt;computed&gt;</em> values now display properly instead of being interpreted as HTML (<a target="_blank" href="https://github.com/chrislewisdev/prettyplan/issues/2">#2</a>)',
            'Resource changes with <em>(forces new resource)</em> now have this highlighted in the table of changes (<a target="_blank" href="https://github.com/chrislewisdev/prettyplan/issues/3">#3</a>)',
            'Italics for <em>&lt;computed&gt;</em> or <em>${variable}</em> values to help set them apart from regular values'
        ]
    },
    {
        version: 'v1.1',
        notes: [
            'Added handy release notes!',
            'Fixed parsing of large AWS IAM policy documents (<a target="_blank" href="https://github.com/chrislewisdev/prettyplan/issues/10">#10</a>)'
        ]
    },
    {
        version: 'v1.0',
        notes: [
            'See your Terraform plans transformed into a beautiful tabulated format!',
            'Support for prettyifying JSON content for easier reading',
            'Theming consistent with the Terraform colour scheme',
            'Works in Firefox, Chrome, and Edge'
        ]
    }
];