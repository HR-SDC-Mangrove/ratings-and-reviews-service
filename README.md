# Ratings & Reviews Microservice

## Overview
A scalable back end built to support increasing traffic for an e-commerce website. Built with JavaScript, Node, Express, AWS (EC2), PostgreSQL, Redis, Loader.io, k6, NGINX and New Relic.

## Technical Challenges and Improvements Made
This microservice was built from the ground up after an extensive planning phase that involved:
- Testing both SQL and NoSQL DBs (MongoDB, MySQL and PostgreSQL) and identifying the best DB for the client's needs
- Designing an efficient ETL process that could seed > 1 million existing csv records
- Building an API server capable of providing data in the format required by the front end
- Extensive stress-testing, load balancing, metrics-collecting and optimizing both in development and production to reach the client's error rate and latency demands
- Deploying the service and integrating it with the front end in production

The end result was a microservice capable of handling > 1000RPS with a 0% error rate and < 50ms latency, a 900% improvement in throughput. The new microservice was implemented without affecting the functionality of the existing application.

**Technical Accomplishments:**
- Designed ETL system with SQL script that seeded over 1 million csv records in < 60s with average < 2ms query time
- Stress-tested and horizontally scaled back-end microservice using Loader.io, k6, New Relic and NGINX with round robin selection to reach > 1000RPS using 3 AWS EC2 micro instances, a 900% increase in throughput
- Architected caching layer with Redis to reduce sudden latency spikes at > 500RPS
