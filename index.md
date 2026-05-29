---
layout: default
title: index
---

Talk to me about land value taxes, skiing, Dark Souls or black metal.

This website is small; make yours small too.

## Work

**Valuebase, <small>Chief Technology Officer</small>**

[Property valuation.](https://www.valuebase.co/)

**Palantir, <small>Software Engineer<br>Palo Alto, CA</small>**

Defense.

**Quicken Loans, <small>Software Engineering Intern<br>Detroit, MI</small>**

Learning.

**Yottabyte, <small>Quality Engineering Intern<br>Bloomfield Hills, MI</small>**

Just happy to be there.

## Projects

**[react-native-invertible-flatlist](https://github.com/nickcharles/react-native-invertible-flatlist)**
DEPRECATED. An invertible FlatList for React Native.

**[Spool](https://github.com/nickcharles/Spool)**
Spool is a modular string formatting and manipulation library for C++, built to match the more robust string features provided by languages like Java and Python.

**[Bluebird]({{ site.url }}/bluebird/)**
Bluebird is a web application that analyzes a Twitter user's friends and followers. It compares the friends and followers and finds those that are not mutual. It will display the people that the user does not follow back, as well as the people the user follows who do not follow the user back. This is an alternative to most web applications that require login authorization.

## Blog

{% for post in site.posts -%}
- {{ post.date | date: "%x" }} - [{{ post.title }}]({{ post.url }})
{% endfor %}

---

## Contact

- [LinkedIn](https://www.linkedin.com/in/nickcmorgan)
- [GitHub](https://github.com/nickcharles)
