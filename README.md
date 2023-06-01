# Introduction

Node + Express application trying to optimize big number addition and subtraction operations. Javascript supports fast arithmetics for up to 16 decimals. Numbers greater than this limit cannot make use of hardware-supported arithmetics. Bigger numbers must perform arithmetic operations at the software basis, which means the bits will be "iterated" and the corresponding elementary school rules will be applied. Complexity-wise, it's impossible to do better than this. Complexity will always be O(n) per operation, where n is the average length of the string operands.

However, we can still improve Theta(n) with a special technique that is proposed by Youssef Bassil & Aziz Barbar of American University of Science, Lebanon.

After defining the endpoints and corresponding request formats, we wil discuss how we can do our best to optimize our algorithmical behavior.

---


# Run Locally
- ```npm start``` from the root directory.
- Application runs on port 3000.
  - Unless PORT is not set as an environment variable. 
  - To run on 1234, ```export PORT=1234```


# Endpoints
- **/inject/data** - POST
  - This endpoint is designed to accept data. It "updates" a user's balance for the given "ticker".
  - Only JSON data is accepted, and it has to obey the following format:
    ```
    {
      "ticker": "BTC",
      "userId": "0xacc6",
      "Balance": "8616257360555148318183557699687673925425738610..."
    }
    ```
    - Field values must always be <b>string</b>, even for "Balance"
    - "Balance" must be a <b>non-negative</b> and <b>numerical-only</b> string.
      - **No decimals** allowed.
      - "00000000" is valid
      - "00000000535" is valid
      - "-5" is NOT valid
      - "+5" is NOT valid
      - There's no upper limit on the number of digits (theoretically)
    - Request will be rejected if all these 3 keys are not present
    - Key names are <b>case-sensitive</b>. "ETH" and "eth" will create 2 separate tickers.
    - Request will be rejected if it contains more than these 3 keys

  - <details>
    <summary>Example request bodies</summary>

    ``` 
    {
      "ticker": "BTC",
      "userId": "0xacc6",
      "Balance": "0000000000000"
    }
    {
      "ticker": "AVAX",
      "userId": "0xacc6",
      "Balance": "289272676318556373476764853708654271216187248338633"
    }
    ```
    </details>
<br>

- **/ticker/<TICKER_NAME>** - GET
  - Returns a JSON with a single key (total) whose value is the <b>total</b> / <b>aggregated</b> amount of given ticker in the system
  - Request body will be ignored
  - If given ticker does not exist in the system, will return "0"
  - <details>
    <summary>Example request</summary>

    ``` 
    $ curl -XGET http://localhost:3000/ticker/ETH 

    returns:
    {"total":"1111111111111133333333333333333333333333333333333"}
    ```
    </details>

<br>

- **/ticker** - GET
  - Returns a JSON containing all the tickers that exists in the system, together with corresponding <b>total</b> / <b>aggregated</b> amounts
  - Request body will be ignored
  - <details>
    <summary>Example request</summary>

    ``` 
    $ curl -XGET http://localhost:3000/ticker

    returns:
    
    {
      "ETH": "1111111111111133333333333333333333333333333333333",
      "AVAX": "22222222222222222222222222222222222",
      "BTC": "414325436235",
      "LUNA": "43643643643643643643643643643643643643643643643643643436436436436436436"
    }
    ```
    </details>

<br>

- **/user/<USER_ID>** - GET
  - Returns a JSON containing each ticker a user has, together with corresponding balances.
  - Request body will be ignored
  - <details>
    <summary>Example request</summary>

    ``` 
    $ curl -XGET http://localhost:3000/user/0xacc98

    returns:
    {
      "LUNA": "0",
      "ETH": "2343252454123425345423423",
      "BTC": "4"
    }
    ```
    </details>

<br>

- **/reset** - POST
  - Removes all data simulating a fresh start.

# Notice
Application <u>does not persist state</u>. There's NO database connectivity configured. All the data is stored in RAM, and restarting will cause loss of everything.

This is mainly because of ease of implementation, and more focusing on algorithmical problems rather than usual processes.

We will later talk about what kind of a database would be suitable for our requirements.

---

# The Problem

Just like every other programming language, JS provides support for big number arithmetics, and big numbers even became a primitive type in JS: <b>bigint</b>.
We can actually get away with using bigint when performing these calculations and storing every numerical value as a string, but here we explore if we could somehow improve / fine-tune its performance.

# How BigInt Works

Being very similar accross different programming languages; BigInteger libraries will first convert the strings to corresponding bit-wise representations, iterate over all the bits, perform elementary-school addition and subtraction, and then convert back to string.

# How BigInt Can Be Improved

Youssef Bassil & Aziz Barbar[*] points-out to the fact that these bit-by-bit operations cost many <u>iterations</u>. Although we have to iterate the strings, we can reduce the number of atomic instructions by leveraging the programming language's typical hardware support for these two basic operations.

In other words, they propose that we can
  1. Determine the maximum number of digits allowed by the programming language for a number (16 for JavaScript)
  2. Divide the strings to chunks with length (16-1=) 15.<br>
      a. To avoid overflows<br>
      b. For C#, this value would be 19-1=18<br>
  3. Perform addition / subtraction over these chunks instead of singular bits or singular characters.
  4. Handle carry-out and borrow-in situations over chunks as a whole, instead of singular bits or singular characters.

By leveraging native addition / subtraction support of the corresponding language, we can enhance the performance of big number arithmetics.

The implementation will differ from language to language, but the idea is simple and implementable in any language.

The worst part is that this implementation <u>does not always yield good results with relatively small big numbers</u>, although authors stated otherwise in the papers. We'll see how the performances compare in the benchmarking section.

But, the best part is that performance better and more better than bigint as number of digits increase.

The corresponding implementations for these methods reside in **/util/bignumber.js** file, and they're properly commented / explained inside.

# Mixing Different Approaches

We talked about the fact that this custom implementation is only better if input is big enough. And, we already know that algebraic operations are way faster with supported number types.

Hence, it wouldn't make sense to stick to one approach only. We need to analyze the performance difference and implement an **algorithm selection interface** which decides the best option regarding the operands of each operation.

Another thing to mention here is <u>how we will perform the aggregation</u>. At the extremes, we have two options:
1. Hold an accumulator that holds the total amount of each ticker, and update it with every balance update
    - Avoid repeating aggregations
    - WRITE performance is low, READ performance is O(1)
    - Makes more sense when number of users is big
2. Do not hold a global accumulator, but aggregate the total amount only when there's a request.
    - Avoid algebra during balance updates
    - WRITE performance is O(1), READ performance is low
    - Makes more sense when number of users is small

For a real-world scenario where a web-scale application tries to optimize their system, they would analyze user behavior (mainly the W/R ratio) and implement a <u>mixture</u> of these approaches.

For example, a system could hold accumulators for <u>each regional deployment</u>, which get updated with every balance update of the users of that region; and when a global aggregation is asked, the regional accumulators could be aggregated instead of every user one by one.

Or, <u>groups of users</u> can be created based on their usage, and one accumulator could be held for each group of n users...

It's clear that optimizations in this regard are all about the <u>atomic units</u> of information. 
- How much of the total state of my entire system will I change with each atomic / user-based update?
- Or, how many bits can I add / subtract with 1 CPU cycle instead of singular bits...

In this demo, I went with creating an accumulator for every ticker that gets updated with each balance update of individual users. I made this decision because I wanted to spend my time with big integer optimization rather than a user-based optimization, because it requires a proper analysis of the user base, which I don't have any.

Please also notice that updating the global accumulators require that we're able to perform both addition and subtraction on big numbers, whose algorithms slightly differ.

# Benchmarking

Let's compare bigint support of JS with our custom implementations with varying input sizes.
In the tests below, I made a very dummy assumption that the ticker accumulator is big (it varies), and the average balance update consists of a **50-digit number**. Of course, these values must be determined after careful analysis of an existing user-base.

In other words; I'll be adding varying sizes of numbers to a 50-digit number in the following tests, and, I'll be subtracting a 50-digit number from varying sizes of numbers.

## 1. Addition
The simple test is as follows:
``` 
var iterations = 100000;
console.time('Function #1');
for(var i = 0; i < iterations; i++ )
    addition(a, b);
console.timeEnd('Function #1')

console.time('Function #2');
for(var i = 0; i < iterations; i++ )
    BigInt(a) + BigInt(b);
console.timeEnd('Function #2') 
```
1. 100 digits<br>
  Function #1: 622.161ms<br>
  <u>Function #2: 211.135ms</u> 
2. 200 digits<br>
  Function #1: 1210.932ms<br>
  <u>Function #2: 503.734ms</u> 
3. 600 digits<br>
  Function #1: 1961.613ms<br>
  <u>Function #2: 1276.604ms</u> 
4. 800 digits<br>
  <u>Function #1: 1707.828ms</u> <br>
  Function #2: 1802.936ms
5. 1000 digits<br>
  <u>Function #1: 2125.183ms</u> <br>
  Function #2: 2688.082ms
6. 1500 digits<br>
  <u>Function #1: 3866.040ms</u> <br>
  Function #2: 5937.767ms
7. 3000 digits <br>
  <u>Function #1: 16629.594ms</u> <br>
  Function #2: 35500.779ms

So a rough "turnover" point can be <b>800 digits</b> for <b>addition</b>.


## 2. Subtraction
The simple test is as follows:
``` 
var iterations = 100000;
console.time('Function #1');
for(var i = 0; i < iterations; i++ )
    subtraction(a, b);
console.timeEnd('Function #1')

console.time('Function #2');
for(var i = 0; i < iterations; i++ )
    BigInt(a) - BigInt(b);
console.timeEnd('Function #2') 
```

1. 100 digits<br>
  Function #1: 408.413ms<br>
  <u>Function #2: 223.413ms</u>
2. 200 digits<br>
  Function #1: 578.513ms<br>
  <u>Function #2: 227.446ms</u>
3. 300 digits<br>
  Function #1: 677.271ms<br>
  <u>Function #2: 439.742ms</u>
4. 400 digits<br>
  Function #1: 1715.926ms<br>
  <u>Function #2: 1595.747ms</u>
5. 600 digits<br>
  <u>Function #1: 1864.711ms</u><br>
  Function #2: 1905.922ms
6. 800 digits<br> 
  Function #1: 3086.263ms <br>
  Function #2: 6182.302ms
7. 3000 digits <br>
<u>Function #1: 18017.343ms</u> <br>
Function #2: 82566.880ms

So a rough "turnover" point can be <b>600 digits</b> for <b>subtraction</b>.

# Algorithm Decision Mechanism

After this stupid / basic analysis, we come up with the following set of rules:
1. Use supported numbers when both of the operands are smaller than 16 digits
2. Use bigint addition / subtraction when number of digits of at least one of the operands is less than 800 / 600.
3. Use our custom implementation when at least one of the operands is greater than these limits.

Please refer to **/util/algebra.js** to see the interface that makes these decisions and completely abstracts these decisions from the user functions.

---
# What About Data Storage?

Data storage/retrieval is always one of the biggest problems for any web-scale deployment. I won't even talk about how we could distribute our data store and make it available somehow, because this report is getting too long.

However, I'd like to say something. Because we're concerned about the performance, the best option is to go with an **in-memory database** like Redis. Redis can also survive in the form of a cluster, and it provides perfect scalability, availability, and replication, using the same management techniques that are also used by other ACID databases.

# Final Notes

Please note that I was first told the deadline was 10 days.
Immediately after 2 days, I received the following message:

<i>"although the deadline is 10 days, hand-in this assignment quicker if possible, because other candidates had already started submitting theirs..."</i>

I already work full-time, and can only work with this task at night. Receiving this message after I only spent 1 night working on this task really stressed me out.

I'd like you to note that there was some additional things I wanted to do, but I didn't do them. Because after receiving that message, I immediately wanted to hand-in this task instead of thinking deeper about the problems.
- I would perform stress testing on the application
- I would have a more extensive research about big number libraries, especially GMP, integrate, and repeat the stress tests
- I would integrate redis and containerize it with the app, so that you could build with one command and enjoy persistent storage

When there's stress, there's no art...
Anyway, thanks for reading the report.

# References
Youssef Bassil & Aziz Barbar<br>
Addition: https://arxiv.org/pdf/1204.0232.pdf<br>
Subtraction: https://arxiv.org/pdf/1204.0220.pdf

# Tools I Frequently Used
https://wordcounter.net/character-count - Char counter<br>
https://text-compare.com/ - For addition / subtraction verification<br>
http://www.javascripter.net/math/calculators/100digitbigintcalculator.htm - For addition / subtraction verification<br>
http://www.easterbrooks.com/personal/bob/randomnumber.php - Big number generation
