# prettyplan [![Build Status](https://travis-ci.com/chrislewisdev/prettyplan.svg?branch=master)](https://travis-ci.com/chrislewisdev/prettyplan)

Prettyplan ([available online here](https://prettyplan.chrislewisdev.com/)) is a small tool to help you view large Terraform plans with ease. By pasting in your plan output, it will be formatted for:

 - Expandable/collapsible sections to help you see your plan at a high level and in detail
 - Tabular layout for easy comparison of old/new values
 - Better display formatting of multi-line strings (such as JSON documents)
 
## Planned Features

Things I'd like to add in the future if possible:

 - Full diff highlighting for new/old values (especially large JSON documents)
 - Command-line integration (e.g. a nicer way of generating pretty plans without copying/pasting all the time)
 
## Contributing

You're welcome to submit ideas/bugs (via the Issues section) or improvements (via Pull Requests)! 

The code has all been converted from JavaScript to TypeScript and is built by webpack. To work on the project locally, you should be able to get everything up and running just by having `npm`, running `npm install` and then `npm run serve` which will open up Prettyplan in your default browser, ready for any changes you make to the source files.

You can also run `npm run build` to build the project without a dev server.
 
### Tests

Tests are being run on every commit and Pull Request via Travis, but if you want to run them locally, you'll need to have `npm` on your PC, and run `npm install` followed by `npm test` in the repository.

## Deployment

The website is served from the `gh-pages` branch, but will be moving to a separate deployment soon. Once moved, the `gh-pages` version will no longer be updated.

## Will this steal sensitive data from my Terraform plans?

No. All the parsing/formatting is done directly in your browser, no data is sent to or from another service.
