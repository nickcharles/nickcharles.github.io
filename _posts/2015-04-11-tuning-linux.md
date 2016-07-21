---
layout: post
title: Tuning Linux
---

Tuning Linux
------------

So I suppose I'll start my first blog post at 4:15 am on a Friday morning. As a bit of background, I'm awake because I tried to mess around with the Intel/AMD graphics drivers on my Linux Mint 17 installation and ended up killing the X server, so here I am on a fresh installation. Linux installation can be a little daunting for first timers and, in my own experience, always has a few quirks that can trip up just about anybody. What I want to do with this post is create a rather comprehensive guide to installing and tuning Linux (Linux Mint 17.1 to be precise) on a laptop. I'm going to try and cover the basics of installation as well as touch on some of the problems that seem to affect laptop Linux users.

One of the most exciting (read: frustrating) parts about Linux installations on laptops is hardware diversity. Because you're not using a Macbook, you very likely don't have the same hardware as the guy sitting next to you, so the Linux operating system may behave differently on your hardware compared to his. Because of that, I'm stating now that this article has been written with only the Samsung Series 7 in mind. While I can't make any promises, the majority of this should work for any average laptop running Mint or any other Ubuntu derivative. Just in case you're wondering, here are the more important specs on this laptop:

##### Samsung Series 7 700Z5B-W01UB
*   Intel i7-2675QM 2.2 GHz
*   TI Radeon HD 6490M / Intel HD Integrated Graphics
*   Hitachi HTS547575A9E384
*   Intel Centrino Wireless-N 6150
*   ELANTech Clickpad

Let's get started. First step is to make a LiveUSB with Mint on it, so go ahead and do that first. Plug in that USB (preferably 2.0, the black ones, 3.0 slots are blue) and reboot the system. Hopefully the computer will boot into the LiveUSB Linux environment. If not you'll have to go into your BIOS and change the boot device priority and place USB at the top of the list. I myself had to actually disable all of the other boot devices AND enable UEFI booting (which makes no sense) before I could force the laptop to boot to the USB through the boot menu. Anyway, once in the live environment click the installation icon and choose the custom partition option. I use a three partition scheme for my installations, the first being a 20GB partition for the root directory `/`. I also make a swap partition with the same amount of space as I have RAM, so 6GB. The final partition is the `/home` partition which will account for the rest of the available disk space. Once you've made your choices go ahead and finish the easy parts (username, password, hostname) and start the installation. Once it's done restart and boot up you're newly installed Linux environment.

Hopefully you're comfortable with the terminal. First thing's first, open that sucker up and do a system update. Let this finish and you'll be up to date with the official repos.

```
sudo apt-get update
sudo apt-get dist-upgrade
```

This is a good time to make a backup. We want to do this just in case we break anything in the system and end up in a nasty state. The idea is that we'll be able to simply revert to the system state that we are currently in. We're going to do this using rsync to essentially copy everything from the system into a backup folder. We'll exclude a couple directories that we don't want to copy every time were going to backup, such as your `/home` directory. Run this command to create your backup. Make sure you change the target directory to reflect where you want to actually place your backup, and also make sure you change my username to your own!

```
rsync -aAXvH --progress --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found","/home"} /* /home/nick/Documents/Backup/
```

Now that you have a backup, if anything breaks you can simply mosey your way into a new terminal and run this command.

```
rsync -aAXvH --progress /home/nick/Documents/Backup /
```

### ATI/Intel Hybrid Graphics
On to the dirty stuff. We're going to start with graphics because in my opinion it is the one that is most likely to get you into trouble. Let's first recall that I am working with an ATI/Intel hybrid graphics configuration, and this information will only work with that configuration! What we're going to do is install the fglrx open source graphics driver and use that to power our display system. Install the driver with this command. The fglrx-pxpress package allows switching between the two devices and the third package is the AMD Catalyst Control Center which allows you to configure your graphics settings. Reboot the computer after the installation.

```
sudo apt-get install fglrx fglrx-pxpress fglrx-amdcccle
sudo reboot
```

Things should be up and running now! Start the control center with this command.

```
gksudo amdcccle
```

You should be given an interface that allows you configure various graphics settings, but the one we're most interested in is the Switchable Graphics tab. You can switch between the two cards, however remember that you will need to reboot whenever you switch cards! Also, make sure you open the control center with gksudo, otherwise the changes may not take effect. You can also check to see which card is currently active by running the following command.

```
sudo fglrxinfo
```

### Battery Optimizations
A huge problem with Linux on laptops is battery life. While I'm still toying with my own settings, here are some of the biggest improvements I have made so far. First is definitely switchable graphics, it's a MASSIVE improvement to use the integrated card over the discrete one. The next comes from a package called laptop-mode-tools, which allows a few kernel features to be tuned for laptop use. We also can use PowerTop to monitor our power consumption.

```
sudo apt-get install powertop
sudo apt-get install laptop-mode-tools
```

There is very little configuration that has to be done out of the box for either of these tools. PowerTop doesn't need any, however it may be helpful to run it once in calibration mode just to ensure our readings are accurate.

```
sudo powertop --calibrate
```

Laptop-mode-tools can be configured through its main configuration file at `/etc/laptop-mode/laptop-mode.conf`. There are also several configuration files for individual modules contained in the `/etc/laptop-mode/conf.d/` directory. I'm not going to cover any of these here as they are very machine and user specific.

### Intel Centrino Wireless-N 6150
The 6150 is a solid wireless card. It's up and running on Mint right out of the box, so there isn't much to configure here. I haven't yet figured out if there is a way to force a bit more performance out of the card, but if anybody has any ideas I'd love to hear them! Not much else to be said here.

### ELANTech Clickpad

The touchpad on this laptop is actually pretty nice. It's big and it's a clickpad, similar to the one offered by Apple on their Macbooks. Its default functionality is alright, though there are quite a few options that can be toggled to beef it up a bit. All of the touch data that's captured by the operating system is handled by a piece of software called Synaptics. It is exposed to the user through an interface called Synclient, which also allows us to do some tweaking. Typing `synclient` into a terminal will list all of the configurable settings and their values. To get more information on any of these values, check out their corresponding entries in `man synaptics`. To set a value, simply run the command `synclient MouseSetting=value`. Note that these settings will not be saved on reboot, more on that later.

The list of features is huge so I won't cover all of them, however here are a few of the notable settings. `TapButtonX` and `ClickButtonX` allow you to choose which button is reported on these events. `PalmDetect` and the related settings allow you to tune palm detection when typing. `XButtonAreaY` is a collection of settings that choose where buttons are in that case that you use different locations of the clickpad as different mouse buttons. `XTwoFingerScroll` is a pair of settings that allow you to enable/disable two finger scrolling, and `XScrollDelta` calibrates how quickly you scroll. There are tons of other options so I encourage you to spend a bit of time reading about each of them and tuning it the way you like. I will say that I have found it easier to ignore the sensitivity settings provided by Synaptics, and simply use the Mint mouse settings menu to adjust instead. This gave me much smoother mouse sensitivity and acceleration, and wasn't nearly as frustrating as dealing with Synaptics.

As I said before, none of these settings will be saved on reboot. Therefore, you'll need to write a configuration file and place it in `/etc/X11/xorg.conf.d/`. There should be a sample file called `50-synaptics.conf` sitting in the directory `/usr/share/X11/xorg.conf.d/`. Simply copy this file into the previously mentioned directory, and edit it as you see fit. I have provided a [sample file]({{ site.url }}/resources/50-synaptics.conf "Example synaptics.conf file"), the one I'm currently using on my machine, as an example. Remember, only the file in `/etc/X11/xorg.conf.d/` will be read by the system, the other simply serves as an example.

So that about wraps this up for now. If you have any questions or comments my email is on my resume, please don't hesitate to reach out!

### Update 7/8/2015 - Display

I wanted to add a bit of information regarding the display. While the screen is pretty nice, the colors are a bit washed out and the viewing angle isn't great. I found a pretty nice custom profile that gives the screen a bit more contrast, now available [here]({{ site.url }}/resources/samsung-series-7-ICC-profile.zip "Samsung Series 7 Custom ICC Profile"). I also recommend high contrast color schemes for text editors and terminal windows. The [Solarized](http://ethanschoonover.com/solarized) profile is pretty well-liked, but in my experience it just doesn't work well on this screen. I've found both [Tango](http://tango.freedesktop.org/Tango_Icon_Theme_Guidelines) and [Monokai](https://terminal.sexy/#Jygi-PjyJygi-SZypuIu9L91ZtnvroH_oe_k-PjydXFe-SZypuIu9L91ZtnvroH_oe_k-fj1) to be good choices.

##### Attachments
*   [Example synaptics.conf]({{ site.url }}/resources/50-synaptics.conf)
*   [Samsung Series 7 Custom ICC Profile]({{ site.url }}/resources/samsung-series-7-ICC-profile.zip)