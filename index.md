---
layout: default
title: index
---

Talk to me about land value taxes, skiing, Dark Souls or black metal.

This website is small; make yours small too.

## Work

**Valuebase, <small>Chief Technology Officer</small>**

[Better property valuation to enable land value taxes.](https://www.valuebase.ai/)

**Palantir, <small>Software Engineer<br>Palo Alto, CA</small>**

Geotemporal data systems, animated map tiles, full Palantir stacks running on ruggedized Windows laptops, and accelerated software delivery on air-gapped networks. Seven years of fun on the defense side of the business.

## Projects

**[react-native-invertible-flatlist](https://github.com/nickcharles/react-native-invertible-flatlist)**

An invertible FlatList for React Native.

**[Spool](https://github.com/nickcharles/Spool)**

Spool is a modular string formatting and manipulation library for C++, built to match the more robust string features provided by languages like Java and Python.

## Blog

{% for post in site.posts -%}
- {{ post.date | date: "%x" }} - [{{ post.title }}]({{ post.url }})
{% endfor %}

---

## Contact

- [LinkedIn](https://www.linkedin.com/in/nickcmorgan)
- [GitHub](https://github.com/nickcharles)
