# Fendy - Front-end framework for building modern website's UI.
Fendy provides a solid architecture, design system and UI library to bootstrap your front-end development.  

## Motivation
--------------------------------------
Atomic Design, SMACSS, OOCSS, ITCSS, BEM, BEVM, BEMIT, CSS Modules, SASS, LESS, PostCSS... feeling dizzy already?
Modern CSS is becoming a jungle, pre-processors, post-processors, architectures, naming conventions, methodologies. All of those are aiming to give developers an easier, faster, whatever-improvement-you-can-think-of way to style modern websites and web applications, long gone are the days when developers had to deal with messy CSS (.css) files in large-scale projects but in the attempt to achieve this we've come to a world of many different solutions, implementations, to solve this problem.

Fendy is born out of my personal seek for a scalable, reusable and modern framework to bootstrap my projects and my journey into all of this CSS slang to find out what the h*** it was all about. Fendy is my implementation of various of these buzz-words to try to solve problems I face commonly.

Disclaimer: I do not intend to have found the best way to write CSS nowadays but just a personal preference on how to put together these theories that better experienced minds have come up with.


## Methodology
--------------------------------------

## Architecture
--------------------------------------
Fendy is heavily based on the idea of components, building rich interfaces using autonomous bits of code is becoming the de facto for building modern websites and web applications. There are many CSS architectures trying to accomplish modularity out there and they all have their cons and pros, at the end though, the most important things to look for on a rich architecture are:

* Predictability: You should be able to know the behaviour of a rule in advance and those rules should apply and affect only the things expected at all times.
* Reusability: You know the rule, don't repeat yourself. When encountering patterns in your code you should be able to use solutions that you've already define without breaking things.
* Maintainability: Large-scale projects are usually hard to maintain, having a well-thought architecture helps you to know exactly where everything is and makes refractor of finding bugs much more easier.
* Scalable: If your project's got a solid architecture it shouldn't matter how big in size and complexity it grows, everything should keep applying the last three points.

Looking at those four points and doing a lot of research it became clear that there isn't a one-size fit-all solution out there but instead there are a lot of solutions that complement each other in a way. At the moment of writing this one of those solutions seemed to me to accomplish the four points in a more clear way: ITCSS.

ITCSS, or Inverted Triangle CSS, takes on namespace and specificity on CSS files by separating the codebase into seven layers avoiding (or trying to) conflicts in your project.

![alt text](https://www.xfivecdn.com/xfive/wp-content/uploads/2016/02/10152838/itcss-layers1.svg "ITCSS layers")

However...(and feel completely free to disagree with me) after going through SMACSS I can't stop feeling like something is missing in the way ITCSS manages layers. It doesn't feel right to me to treat layout as objects, I appreciate much more the way SMACSS handles this, giving layout styles it's own category which is why I've decided to brake the rules (😈) and give layout it's own layer in the inverted triangle.

![alt text](https://www.xfivecdn.com/xfive/wp-content/uploads/2016/02/10152838/itcss-layers1.svg "ITCSS layers")

## Naming convention
--------------------------------------
Now that we've define where to put each class in our projects we need to describe **how** to actually name those classes.

When it comes to naming conventions in CSS the list is a bit narrower, either you come up with your own or you can use BEM which has been around for a while and many developers are already feeling comfortable with it.

BEM suggests us to breakdown the classes in our projects into three groups:
* Blocks
* Elements
* Modifiers
This naming works to identify related elements in our codebase and quickly identify if there are modifications to a base rule. However BEM doesn't give us much of a clue to identify where the block and element styles are defined in our ITCSS architecture we need a way to relate architecture to naming classes and that's what BEMIT tries to accomplish.

BEMIT uses namespace prefixes to give us more information about the behavior of a class. Using these namespaces we can relate blocks and elements to ITCSS architecture, for example, Fendy uses the following namespaces:

* .o- : Object
* .l- : Layout (borrowed from SMACCS)
* .c- : Component
* .is- : State class (also borrowed from SMACCS)
* .js- : JavaScript Hook
* .u- : Utility class
* .t# | .s# : Typography sizes

Using these namespaces we can have a quick visual on what job a class is doing and we can find it's corresponding file easier as we already know to what layer it belongs.

Other namespaces you might be tempted to use are:

* .t- : Theme class
* .s- : Scope
* ._ : Hack style
* .qa- : Quality Assurance

## Pre-processor or Post-processor
--------------------------------------
