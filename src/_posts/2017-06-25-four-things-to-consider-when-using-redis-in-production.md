---
date: 2017-06-25 17:40:00 -0500
layout: post
title: Four things to consider when using Redis in production
tags:
  - redis
---

Ruby programmers rely on [Redis](https://redis.io) as a high-performance key-value store for many different jobs. Redis is suitable for many different tasks, including caching, acting as the transport medium for a message bus, and service analytics. Redis is often one of the first external dependencies you reach for as a Ruby programmer because it forms the backbone of the [Resque](https://github.com/resque/resque) and [Sidekiq](http://sidekiq.org/) asynchronous job systems.

When you’re starting a new project, it is tempting to set up the bare minimum configuration for Redis because it works well out of the box. However, once you’ve started to put some load on the system, there are several concerns that you should be aware of when using Redis. In this post, I’ll talk about some of these concerns and some high-level ways of addressing them.

<!-- more -->

Ruby programmers rely on [Redis](https://redis.io) as a high-performance key-value store for many different jobs. Redis is suitable for many different tasks, including caching, acting as the transport medium for a message bus, and service analytics. Redis is often one of the first external dependencies you reach for as a Ruby programmer because it forms the backbone of the [Resque](https://github.com/resque/resque) and [Sidekiq](http://sidekiq.org/) asynchronous job systems.

When you’re starting a new project, it is tempting to set up the bare minimum configuration for Redis because it works well out of the box. However, once you’ve started to put some load on the system, there are several concerns that you should be aware of when using Redis. In this post, I’ll talk about some of these concerns and some high-level ways of addressing them.

The four main concerns I will discuss in this post are monitoring, security, high availability and redundancy, and horizontal scalability. This is the first in a series of posts where I will cover these intermediate-to-advanced topics in depth.

### Monitoring

Because Redis works so well out of the box, monitoring is something that can easily be put out of mind. However, once you start loading a lot of data into it, you will want to start monitoring your Redis instance to make sure it doesn’t run out of memory, all your commands are running quickly, and your connections are not being refused.

Redis ships with a lot of intelligent monitoring tools. You can query the database for internal statistics about the system. It also tracks all queries that take longer than a specified threshold to complete. Lastly, you can get a feeling for what is taking up space in your database by randomly sampling keys and measuring their size.

There are many ways to handle the random samples and there are [many different](https://github.com/snmaynard/redis-audit) sets of [tools to
help](https://github.com/antirez/redis-sampler) you do this type of auditing.

### Security

Your clients, by default, communicate with Redis over an unencrypted TCP connection. That means that all of the data that you send over the wire to your Redis server can be read by intermediate parties. For this reason, the official Redis documentation [advises you](https://redis.io/topics/security) to only allow access to the Redis server from internal networks.

If you host on a platform-as-a-service like Heroku, you do not have control over the IP addresses from which your application will connect to your Redis server. As such, you should add a TLS-terminating proxy in front of your Redis server to encrypt the traffic between your clients and Redis server.

### High Availability and Redundancy

Having a single Redis server means that you’re trusting that the machine on which you’re running Redis will not have any hardware problems. This is the heart of high availability and redundancy.

Redis has built-in support for running in a leader-follower topology. This functionality available directly through the Redis configuration. You also will want to run multiple instances of the [Redis Sentinel watcher daemon](https://redis.io/topics/sentinel) to handle the quorum decisions about leader election and failover.

Aside from the direct benefit of redundancy, you may also be able to take advantage of distributing your read queries across the followers to take some of the load off the leader. There are caveats to this and whether or not you can use this functionality is highly dependent on your usage patterns, but it’s a nice benefit by itself and a great addition to the high availability setup.

### Horizontal Scalability

When your workload gets big enough and the size of the database reaches beyond that which can be kept in memory, you will need to turn to another built-in feature of Redis: the [Redis Cluster system](https://redis.io/topics/cluster-spec).

Redis Cluster shards your database across many different nodes. It does so by segmenting your data into “slots” that are distributed across your cluster nodes. Within the cluster, there are many leader-follower sets that use a gossip protocol to coordinate. The data slots are distributed among the leaders who then replicate their data to their followers.

It’s worth noting that Redis Cluster only allows you to use one database, so if you use the multiple-database feature of Redis you will have to rethink how you want to handle that before implementing a Redis Cluster.

Redis [ships with a script](https://github.com/antirez/redis/tree/4.0/utils/create-cluster) that will help you set up a Redis Cluster.

### Conclusion

Redis is a wonderful piece of software. But, like all software, it takes some configuration to get the best out of it. While these four concerns are not an exhaustive list of what you should consider when using Redis at scale, they are the four concerns that I have had to handle throughout my career.

Over the next few weeks, I will discuss each of these four concerns in depth and suggest ways that we can configure our applications to handle all of them. Since I am primarily a Ruby programmer, I will be focusing mostly on what these solutions look like from that perspective. However, there will be some system administration concerns as well.

Are there some concerns you’ve had to address with Redis? Did I miss any big topics? Drop me a line [on Twitter](https://twitter.com/mherold) to let me know!
