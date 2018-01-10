---
layout: post
title: Creating a Google Calendar for the 2018 Winter Olympics
---

Creating a Google Calendar for the 2018 Winter Olympics
-------------------------------------------------------

I was unable to find a nice way to visualize all of the scheduling information for the winter olympics so I decided to throw it all into a Google Calendar. There are a ton of events that would take a long time to manually enter so I set out to do this programatically. There are some things left out here but the gist is correct.

The lesson here is that the fastest way to do things is certainly not always the best way.

First copy all of the source from [here](https://www.pyeongchang2018.com/en/schedule). We only need everything contained in the body, so go ahead and copy just that section. The first five elements are useless so let's just cut those out now. Also get the closing body tag on the last line. All that's left are a bunch of divs that have event information in them. We'll call this file original-olympics.txt.

Now, some text processing. First remove empty lines:

```
sed '/^$/d' original-olympics.txt > no-blanks-olympics.txt
```

Remove the `<hr>` tags lying around on their own lines:

```
sed '/<hr>/d' no-blank-olympics.txt > no-hr-olympics.txt
```

And let's remove the trailing bits that contain the URLs for buying tickets:

```
sed -E 's/ <span class="ticket_link">.*//' no-hr-olymics.txt > no-tickets.txt
```

All that's left are the lines that either define the title and date of an event or groups of lines that define whether or not it's a medal event, the location, time, and may contain some other notes.

Let's look at the title and date lines first. Right off the bat we notice that all of them but the first begin with some extra text `</div></div>`. To clean those up:

```
sed 's/<\/div><\/div>//' no-tickets.txt > clean-olympics.txt
```

Now let's extract the title text from those, giving us the event category and date on one line.

```
sed -E 's/.*\>([^\>]* - [^\<]*).*/\1/' clean-olympic.txt > categories-olympics.txt
```

Winging it here. Let's first list whether or not the events are medal or non-medal events.

```
sed -E 's/<div class="nonMedalEvent">/Non-medal Event,/' categories-olympics.txt > non-medal-events.txt
sed -E 's/<div class="medalEvent">/Medal Event,/' non-medal-events.txt > medal-events.txt
```

Notice we threw in some commas there because we are building a CSV. Turns out we missed a few events as well because apparently there are small medal events?

```
sed -E 's/<div class="medalEvent small">/Medal Event,/' medal-events.txt > small-medal-events.txt
```

Fixed. Now let's parse out the event titles.

```
sed -E 's/<span class="eventTitle">([^<]*)<\/span>/\1,/' small-medal-events.txt > event-titles.txt
```

This didn't work perfectly. The HTML isn't written correctly for some of the events, and notes end up being where the time tags are. An example:

```
Non-medal Event,<span class="eventTitle">Mixed Doubles Round Robin #1 <em>9:05-11:00</em></span>Gangneung Curling Centre<span class="eventTime">Sheet A USA vs OAR<br>
Sheet B CAN vs NOR<br>
Sheet C KOR vs FIN<br>
Sheet D CHN vs SUI </span>
```

Others have some notes where the times are. An example:

```
Non-medal Event,Men's Preliminary Round,Kwandong Hockey Centre<span class="eventTime"><em>SUI vs CAN</em> 21:10-23:30</span>
```

We need to handle each of these cases separately. Starting with the latter, let's make sure we pull out the opponent information and the timing from the hockey games. We'll keep the opponent information as notes,

```
sed -E 's/<span class="eventTime"><em>([^<]*)<\/em>([^<]*)<\/span>/,\2, \1/' small-events.txt > hockey-events.txt
```

Now to the former. We'll clean these up in one go by swapping the time and the location.

```
sed -E 's/<span class="eventTitle">([^<]*)<em>([^<]*)<\/em><\/span>([^<]*)/\1,\3,\2,/' hockey-events.txt > curling-events.txt
```

I briefly went through in my text editor and cleaned up all of the `<br>` tags in the notes for these and brought them onto one line. They now look like this:

```
Non-medal Event,Mixed Doubles Round Robin #1 ,Gangneung Curling Centre,9:05-11:00,<span class="eventTime">Sheet A USA vs OAR Sheet B CAN vs NOR Sheet C KOR vs FIN Sheet D CHN vs SUI </span>
```

Before we move onto fixing the times, there is a bit left to clean up that I'm doing manually. First, there are a few `<br>` tags for some Alpine skiing event times. Apparently these events are happening twice on the same day at differnt times. I'm just going to create two otherwise identical rows so I can treat these as different events when I go to create my calendar.

```
Medal Event,Women's Alpine Combined,Jeongseon Alpine Centre<span class="eventTime">11:00-12:25<br>
14:30-15:45</span>
```

becomes

```
Medal Event,Women's Alpine Combined,Jeongseon Alpine Centre,11:00-12:25
Medal Event,Women's Alpine Combined,Jeongseon Alpine Centre,14:30-15:45
```

There are also a few `<br>` tags that are present in the Figure skating section. These look to be caused by the weird way they are formatting team events. These are going from

```
Non-medal Event,<span class="eventTitle">Team Event:<br>
Men’s Single Short Program<br>
Pairs Short Program</span>Gangneung Ice Arena<span class="eventTime">10:00-13:30</span>
```

to

```
Non-medal Event, Team Event: Men’s Single Short Program / Pairs Short Program, Gangneung Ice Arena<span class="eventTime">10:00-13:30</span>
```

To remove the last of the HTML let's fix up the times:

```
sed -E 's/<span class="eventTime">([^<]*)<\/span>/,\1/' curling-events.txt > times.txt
```

Before we do further processing I'm going to fix the HTML encoded ampersands: `s/&amp;/&/`.

Alright, now we have a bunch of lines that are of the format:

```
$eventCategory, $eventDate
```

And each of those lines is followed by one or more lines of the format:

```
$isMedalEvent, $eventTitle, $eventLocation, $eventStartTime-$eventEndTime, $notes
```

where the notes and the event time are optional.

Using the directions described here https://support.google.com/calendar/answer/37118?hl=en I'm going to build a CSV that conforms to the following format:

```
Subject, Start Date, Start Time, End Time, All Day Event, Location, Description
```

Let's write some Python!

```python
import re

f = open('times.txt', 'r')
out = open('olympics.csv', 'w')

line = f.readline();
while (line != ''):
	parts = line.replace("\n", "").split(",")
	print(parts)
	# Line is a category line
	if (len(parts) == 2):
		category = parts[0]
		date = parts[1]
	# Line has no time
	elif (len(parts) == 3):
		isMedalEvent = parts[0]
		eventTitle = parts[1]
		eventLocation = parts[2]
		out.write(category + " - " + eventTitle + "," + date + ",,,true," + eventLocation + ',' + isMedalEvent + "  " + '\n')
	# Line has time
	elif (len(parts) == 4):
		isMedalEvent = parts[0]
		eventTitle = parts[1]
		eventLocation = parts[2]
		eventTime = parts[3]
		timeParts = eventTime.split("-")
		eventStart = timeParts[0]
		eventEnd = timeParts[1]
		out.write(category + " - " + eventTitle + "," + date + "," + eventStart + "," + eventEnd + ",false," + eventLocation + ',' + isMedalEvent + "  " + '\n')
	# Line has notes
	elif (len(parts) == 5):
		isMedalEvent = parts[0]
		eventTitle = parts[1]
		eventLocation = parts[2]
		eventTime = parts[3]
		timeParts = eventTime.split("-")
		eventStart = timeParts[0]
		eventEnd = timeParts[1]
		eventNotes = parts[4]
		out.write(category + " - " + eventTitle + "," + date + "," + eventStart + "," + eventEnd + ",false," + eventLocation + "," + isMedalEvent + "  " + eventNotes + '\n')
	line = f.readline()

f.close()
out.close()
```

Certainly nothing to be proud of, but it gets the job done! This gives me a nice CSV that I can import in Google Calendar. The end result is [here](http://nickcmorgan.com/olympic-calendar) and I think it may be the most useful version of the Olympic calendar that currently exists on the internet.
