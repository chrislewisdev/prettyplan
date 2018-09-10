# prettyplan

Prettyplan ([available online here](https://chrislewisdev.github.io/prettyplan/)) is a small tool to help you view large Terraform plans with ease. By pasting in your plan output, it will be formatted for:

 - Expandable/collapsible sections to help you see your plan at a high level and in detail
 - Tabular layout for easy comparison of old/new values
 - Better display formatting of multi-line strings (such as JSON documents)
 
## Planned Features

Things I'd like to add in the future if possible:

 - Full diff highlighting for new/old values (especially large JSON documents)
 - Command-line integration (e.g. a nicer way of generating pretty plans without copying/pasting all the time)
 
## Contributing

You're welcome to submit ideas/bugs (via the Issues section) or improvements (via Pull Requests)! 

The code in its current state aims to be as simple as possible: it's all plain JavaScript, so no build is required. Just edit the HTML/CSS/JS in whatever editor you like, then test it out by opening `index.html` in your browser!
 
## Will this steal sensitive data from my Terraform plans?

No. All the parsing/formatting is done directly in your browser, no data is sent to or from another service.
