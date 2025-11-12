  console.log('🌱 Starting database seed...')

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await prisma.vote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.postTag.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.report.deleteMany()
  await prisma.moderationLog.deleteMany()
  await prisma.ban.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'admin@ntua.gr',
      name: 'Admin User',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      reputation: 10000,
      bio: 'Forum administrator and moderator',
    },
  })

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@ntua.gr',
      name: 'Maria Papadopoulos',
      username: 'maria_mod',
      password: hashedPassword,
      role: 'MODERATOR',
      reputation: 5000,
      bio: 'ECE student and forum moderator',
    },
  })

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'nikolas@ntua.gr',
        name: 'Nikolas Neofytou',
        username: 'nikolas_n',
        password: hashedPassword,
        reputation: 850,
        bio: '4th year ECE student, interested in algorithms and machine learning',
      },
    }),
    prisma.user.create({
      data: {
        email: 'george@ntua.gr',
        name: 'George Papadakis',
        username: 'george_p',
        password: hashedPassword,
        reputation: 620,
        bio: '3rd year student, specializing in electronics and embedded systems',
      },
    }),
    prisma.user.create({
      data: {
        email: 'elena@ntua.gr',
        name: 'Elena Konstantinou',
        username: 'elena_k',
        password: hashedPassword,
        reputation: 1250,
        bio: 'ECE graduate student, TA for signals and systems',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dimitris@ntua.gr',
        name: 'Dimitris Stavrou',
        username: 'dimitris_s',
        password: hashedPassword,
        reputation: 340,
        bio: '2nd year student, loves circuit design',
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna@ntua.gr',
        name: 'Anna Georgiou',
        username: 'anna_g',
        password: hashedPassword,
        reputation: 490,
        bio: 'Interested in computer networks and telecommunications',
      },
    }),
  ])

  // Create Categories
  console.log('📁 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Algorithms & Data Structures',
        slug: 'algorithms',
        description: 'Questions about algorithms, complexity analysis, and data structures',
        color: '#3B82F6',
        icon: 'code',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electronics & Circuits',
        slug: 'electronics',
        description: 'Circuit analysis, analog and digital electronics',
        color: '#F59E0B',
        icon: 'cpu',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Calculus, linear algebra, differential equations, and more',
        color: '#8B5CF6',
        icon: 'calculator',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Signal Processing',
        slug: 'signal-processing',
        description: 'Digital signal processing, Fourier transforms, filters',
        color: '#10B981',
        icon: 'radio',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Computer Networks',
        slug: 'networks',
        description: 'Network protocols, TCP/IP, routing, and telecommunications',
        color: '#EC4899',
        icon: 'network',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Embedded Systems',
        slug: 'embedded',
        description: 'Microcontrollers, Arduino, FPGA, and embedded programming',
        color: '#EF4444',
        icon: 'microchip',
      },
    }),
    prisma.category.create({
      data: {
        name: 'General Discussion',
        slug: 'general',
        description: 'General topics, student life, career advice',
        color: '#6B7280',
        icon: 'message-circle',
      },
    }),
  ])

  // Create Tags
  console.log('🏷️  Creating tags...')
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'homework-help', slug: 'homework-help', description: 'Help with homework assignments' } }),
    prisma.tag.create({ data: { name: 'python', slug: 'python', description: 'Python programming' } }),
    prisma.tag.create({ data: { name: 'c-cpp', slug: 'c-cpp', description: 'C/C++ programming' } }),
    prisma.tag.create({ data: { name: 'java', slug: 'java', description: 'Java programming' } }),
    prisma.tag.create({ data: { name: 'circuit-analysis', slug: 'circuit-analysis', description: 'Circuit analysis techniques' } }),
    prisma.tag.create({ data: { name: 'fourier', slug: 'fourier', description: 'Fourier transforms and analysis' } }),
    prisma.tag.create({ data: { name: 'tcp-ip', slug: 'tcp-ip', description: 'TCP/IP networking' } }),
    prisma.tag.create({ data: { name: 'arduino', slug: 'arduino', description: 'Arduino projects' } }),
    prisma.tag.create({ data: { name: 'exam-prep', slug: 'exam-prep', description: 'Exam preparation' } }),
    prisma.tag.create({ data: { name: 'linear-algebra', slug: 'linear-algebra', description: 'Linear algebra topics' } }),
    prisma.tag.create({ data: { name: 'complexity', slug: 'complexity', description: 'Computational complexity' } }),
    prisma.tag.create({ data: { name: 'machine-learning', slug: 'machine-learning', description: 'ML and AI topics' } }),
  ])

  // Create Posts
  console.log('📝 Creating posts...')
  
  const post1 = await prisma.post.create({
    data: {
      title: 'How to analyze the time complexity of recursive algorithms?',
      content: `<p>I'm having trouble understanding how to properly analyze the time complexity of recursive algorithms. For example, how would I analyze the following merge sort implementation?</p>
<pre><code>def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)</code></pre>
<p>I know it's O(n log n) but I want to understand the mathematical reasoning behind it using the master theorem or recurrence relations.</p>
<p>Any help would be greatly appreciated!</p>`,
      published: true,
      viewCount: 127,
      voteCount: 8,
      authorId: users[0].id,
      categoryId: categories[0].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags.find(t => t.slug === 'python')!.id },
      { postId: post1.id, tagId: tags.find(t => t.slug === 'complexity')!.id },
      { postId: post1.id, tagId: tags.find(t => t.slug === 'homework-help')!.id },
    ],
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'Understanding Kirchhoff\'s Voltage Law in Complex Circuits',
      content: `<p>I'm working on a circuit problem and I'm stuck applying KVL to a circuit with multiple loops. Here's the circuit:</p>
<p>We have a circuit with two voltage sources (12V and 6V) and three resistors (R1=4Ω, R2=6Ω, R3=3Ω) arranged in a complex configuration with two loops.</p>
<p><strong>My question:</strong> When applying KVL to each loop, how do I handle the current direction? Should I assume a direction and then check if the result is negative?</p>
<p>I've tried solving this using nodal analysis but I keep getting the wrong answer compared to the solutions manual.</p>`,
      published: true,
      viewCount: 89,
      voteCount: 5,
      authorId: users[1].id,
      categoryId: categories[1].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post2.id, tagId: tags.find(t => t.slug === 'circuit-analysis')!.id },
      { postId: post2.id, tagId: tags.find(t => t.slug === 'homework-help')!.id },
    ],
  })

  const post3 = await prisma.post.create({
    data: {
      title: 'Best resources for learning Fourier Transforms?',
      content: `<p>I'm taking Signal Processing this semester and I'm finding Fourier Transforms really challenging. The professor goes through the material quickly and I need some supplementary resources.</p>
<p>What I'm looking for:</p>
<ul>
<li>Good YouTube channels or online courses</li>
<li>Practice problems with solutions</li>
<li>Intuitive explanations (not just mathematical proofs)</li>
</ul>
<p>I understand the basic concept that we're decomposing signals into sine and cosine waves, but I struggle with:</p>
<ol>
<li>The mathematical notation and integrals</li>
<li>Understanding when to use DFT vs FFT vs continuous FT</li>
<li>Practical applications</li>
</ol>
<p>Any recommendations would be super helpful!</p>`,
      published: true,
      viewCount: 156,
      voteCount: 12,
      authorId: users[3].id,
      categoryId: categories[3].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post3.id, tagId: tags.find(t => t.slug === 'fourier')!.id },
      { postId: post3.id, tagId: tags.find(t => t.slug === 'exam-prep')!.id },
    ],
  })

  const post4 = await prisma.post.create({
    data: {
      title: 'Arduino project: Temperature monitoring system',
      content: `<p>Hey everyone! I just finished a cool Arduino project and wanted to share it with the community.</p>
<p><strong>Project:</strong> Temperature and Humidity Monitoring System with LCD Display</p>
<p><strong>Components used:</strong></p>
<ul>
<li>Arduino Uno</li>
<li>DHT22 temperature/humidity sensor</li>
<li>16x2 LCD display</li>
<li>Breadboard and jumper wires</li>
</ul>
<p><strong>Features:</strong></p>
<ul>
<li>Real-time temperature and humidity readings</li>
<li>Warning LED when temperature exceeds threshold</li>
<li>Data logging to SD card (optional)</li>
</ul>
<p>The code is available on my GitHub if anyone's interested. It was a great learning experience for working with sensors and displays!</p>
<p>If you have any questions about the implementation or want to suggest improvements, feel free to ask!</p>`,
      published: true,
      viewCount: 203,
      voteCount: 15,
      authorId: users[1].id,
      categoryId: categories[5].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post4.id, tagId: tags.find(t => t.slug === 'arduino')!.id },
      { postId: post4.id, tagId: tags.find(t => t.slug === 'c-cpp')!.id },
    ],
  })

  const post5 = await prisma.post.create({
    data: {
      title: 'Linear Algebra: Eigenvalues and Eigenvectors intuition',
      content: `<p>I can calculate eigenvalues and eigenvectors mechanically by solving the characteristic equation, but I don't really understand what they <em>mean</em> geometrically.</p>
<p>For example, given a matrix:</p>
<pre>A = | 2  1 |
    | 1  2 |</pre>
<p>I can find λ₁=3, λ₂=1 with corresponding eigenvectors, but what does this tell me about the transformation represented by matrix A?</p>
<p>I've heard that eigenvectors represent "directions that don't change" under the transformation and eigenvalues represent "how much they scale", but I'm having trouble visualizing this.</p>
<p>Could someone provide a clear geometric interpretation or maybe point me to good visualization tools?</p>`,
      published: true,
      viewCount: 178,
      voteCount: 10,
      authorId: users[4].id,
      categoryId: categories[2].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post5.id, tagId: tags.find(t => t.slug === 'linear-algebra')!.id },
      { postId: post5.id, tagId: tags.find(t => t.slug === 'homework-help')!.id },
    ],
  })

  const post6 = await prisma.post.create({
    data: {
      title: 'TCP vs UDP: When to use which protocol?',
      content: `<p>I'm working on a network programming assignment where I need to implement a client-server application. I'm confused about when I should use TCP vs UDP.</p>
<p>I understand that:</p>
<ul>
<li>TCP is connection-oriented and reliable</li>
<li>UDP is connectionless and faster but unreliable</li>
</ul>
<p>But in practice, how do I decide? For my assignment, I'm building a simple chat application. Should I use TCP for the text messages and UDP for something like typing indicators?</p>
<p>Also, what about video streaming applications? I've heard they use UDP, but then how do they handle packet loss?</p>`,
      published: true,
      viewCount: 142,
      voteCount: 7,
      authorId: users[0].id,
      categoryId: categories[4].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post6.id, tagId: tags.find(t => t.slug === 'tcp-ip')!.id },
      { postId: post6.id, tagId: tags.find(t => t.slug === 'java')!.id },
    ],
  })

  const post7 = await prisma.post.create({
    data: {
      title: 'Machine Learning course recommendations',
      content: `<p>Hi everyone! I'm planning my courses for next semester and I want to take a machine learning course. I see there are two options:</p>
<ol>
<li><strong>Introduction to Machine Learning</strong> - Covers basics, linear regression, classification, SVMs</li>
<li><strong>Deep Learning and Neural Networks</strong> - More advanced, focuses on CNNs, RNNs, transformers</li>
</ol>
<p>I have a good background in:</p>
<ul>
<li>Linear Algebra</li>
<li>Probability & Statistics</li>
<li>Python programming</li>
<li>Algorithms</li>
</ul>
<p>But I haven't taken any ML courses before. Should I start with the intro course or can I jump into deep learning directly?</p>
<p>Also, how much time commitment do these courses require outside of class? I'm already taking 4 other technical courses.</p>`,
      published: true,
      viewCount: 94,
      voteCount: 6,
      authorId: users[4].id,
      categoryId: categories[6].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post7.id, tagId: tags.find(t => t.slug === 'machine-learning')!.id },
      { postId: post7.id, tagId: tags.find(t => t.slug === 'python')!.id },
    ],
  })

  const post8 = await prisma.post.create({
    data: {
      title: 'Help with Dynamic Programming - Longest Common Subsequence',
      content: `<p>I'm stuck on the LCS (Longest Common Subsequence) problem. I understand the recursive solution but I'm having trouble converting it to a DP solution.</p>
<p><strong>Recursive solution I have:</strong></p>
<pre><code>def lcs(X, Y, m, n):
    if m == 0 or n == 0:
        return 0
    if X[m-1] == Y[n-1]:
        return 1 + lcs(X, Y, m-1, n-1)
    else:
        return max(lcs(X, Y, m, n-1), lcs(X, Y, m-1, n))</code></pre>
<p>I know I need to use a 2D table for memoization, but I'm confused about:</p>
<ol>
<li>What do the table dimensions represent?</li>
<li>How do I fill the table (bottom-up vs top-down)?</li>
<li>How do I reconstruct the actual subsequence from the table?</li>
</ol>
<p>Any step-by-step explanation would be really helpful!</p>`,
      published: true,
      viewCount: 67,
      voteCount: 4,
      authorId: users[3].id,
      categoryId: categories[0].id,
    },
  })

  await prisma.postTag.createMany({
    data: [
      { postId: post8.id, tagId: tags.find(t => t.slug === 'python')!.id },
      { postId: post8.id, tagId: tags.find(t => t.slug === 'homework-help')!.id },
    ],
  })

  // Create Comments
  console.log('💬 Creating comments...')
  
  // Comments on post1 (Time Complexity)
  const comment1_1 = await prisma.comment.create({
    data: {
      content: `<p>Great question! To analyze merge sort using the Master Theorem:</p>
<p>The recurrence relation is: T(n) = 2T(n/2) + O(n)</p>
<p>Using the Master Theorem with a=2, b=2, and f(n)=n:</p>
<ul>
<li>n^(log_b(a)) = n^(log_2(2)) = n^1 = n</li>
<li>Since f(n) = Θ(n^(log_b(a))), we're in case 2</li>
<li>Therefore, T(n) = Θ(n log n)</li>
</ul>
<p>Hope this helps!</p>`,
      authorId: users[2].id,
      postId: post1.id,
      voteCount: 5,
      isAccepted: true,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>Thanks! This makes sense. So the key is that the merge operation takes linear time O(n), and we're dividing the problem in half at each level, giving us log n levels total.</p>`,
      authorId: users[0].id,
      postId: post1.id,
      parentId: comment1_1.id,
      voteCount: 2,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>I'd also recommend drawing out the recursion tree. It really helped me visualize why it's O(n log n). Each level does O(n) work and there are log n levels.</p>`,
      authorId: moderator.id,
      postId: post1.id,
      voteCount: 3,
    },
  })

  // Comments on post2 (KVL)
  await prisma.comment.create({
    data: {
      content: `<p>When applying KVL, you can assume any direction for the current. If your assumption is wrong, you'll get a negative value, which just means the current flows in the opposite direction.</p>
<p>Here's the approach:</p>
<ol>
<li>Assume a direction for each current</li>
<li>Apply KVL to each independent loop</li>
<li>Solve the system of equations</li>
<li>Interpret negative currents as flowing opposite to your assumption</li>
</ol>
<p>Make sure you're consistent with your sign conventions!</p>`,
      authorId: users[2].id,
      postId: post2.id,
      voteCount: 4,
      isAccepted: true,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>Also, double-check that you're correctly accounting for voltage drops across resistors. The voltage drop is always in the direction of current flow, using V=IR.</p>`,
      authorId: users[4].id,
      postId: post2.id,
      voteCount: 2,
    },
  })

  // Comments on post3 (Fourier Transforms)
  await prisma.comment.create({
    data: {
      content: `<p>I highly recommend 3Blue1Brown's video series on Fourier Transforms! The visualization is amazing and really builds intuition.</p>
<p>For practice problems, check out "Signals and Systems" by Oppenheim - it has tons of worked examples.</p>
<p>As for when to use each type:</p>
<ul>
<li><strong>Continuous FT:</strong> Theoretical analysis of continuous signals</li>
<li><strong>DFT:</strong> When working with discrete/sampled signals</li>
<li><strong>FFT:</strong> Fast algorithm for computing DFT (use this in practice!)</li>
</ul>`,
      authorId: users[2].id,
      postId: post3.id,
      voteCount: 8,
      isAccepted: true,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>Also check out the MIT OpenCourseWare lectures on Signal Processing. They're free and very comprehensive!</p>`,
      authorId: users[0].id,
      postId: post3.id,
      voteCount: 4,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>For practical applications, try implementing a simple audio equalizer or spectrum analyzer. It really helps connect the theory to real-world uses!</p>`,
      authorId: moderator.id,
      postId: post3.id,
      voteCount: 3,
    },
  })

  // Comments on post4 (Arduino)
  await prisma.comment.create({
    data: {
      content: `<p>Nice project! How accurate is the DHT22? I've been considering using it for a similar project but I've heard it can be a bit noisy.</p>`,
      authorId: users[3].id,
      postId: post4.id,
      voteCount: 2,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>This is great! Could you share the GitHub link? I'm working on something similar and would love to see your code structure.</p>`,
      authorId: users[4].id,
      postId: post4.id,
      voteCount: 3,
    },
  })

  // Comments on post5 (Eigenvalues)
  await prisma.comment.create({
    data: {
      content: `<p>Think of it this way: when you multiply a matrix A by a vector v, you're transforming that vector. Most vectors change both direction AND magnitude.</p>
<p>But eigenvectors are special - they only change in magnitude (scaled by the eigenvalue), not direction!</p>
<p>For your example with A = [[2,1],[1,2]]:</p>
<ul>
<li>The eigenvector for λ=3 gets stretched by 3x but keeps its direction</li>
<li>The eigenvector for λ=1 stays the same size (scaled by 1x)</li>
</ul>
<p>Check out this visualization tool: setosa.io/ev/eigenvectors-and-eigenvalues/</p>`,
      authorId: users[2].id,
      postId: post5.id,
      voteCount: 7,
      isAccepted: true,
    },
  })

  // Comments on post6 (TCP vs UDP)
  await prisma.comment.create({
    data: {
      content: `<p>For a chat application, definitely use TCP! You want guaranteed delivery of messages in order.</p>
<p>Use UDP when:</p>
<ul>
<li>Speed is more important than reliability (gaming, live video)</li>
<li>You can tolerate some packet loss</li>
<li>You're implementing your own reliability on top (like QUIC)</li>
</ul>
<p>For video streaming, UDP is preferred because:</p>
<ol>
<li>A few dropped frames are better than delayed frames</li>
<li>Retransmitting old video data doesn't make sense</li>
<li>Lower latency is critical for live streaming</li>
</ol>`,
      authorId: moderator.id,
      postId: post6.id,
      voteCount: 5,
      isAccepted: true,
    },
  })

  // Comments on post7 (ML courses)
  await prisma.comment.create({
    data: {
      content: `<p>I'd definitely recommend starting with the intro course first. While you have the prerequisites for deep learning, the intro course will give you important foundations like:</p>
<ul>
<li>Feature engineering</li>
<li>Model evaluation and validation</li>
<li>Overfitting/underfitting concepts</li>
<li>Different types of learning problems</li>
</ul>
<p>These concepts apply to all of ML, including deep learning. You'll appreciate the deep learning course much more with this foundation.</p>`,
      authorId: users[2].id,
      postId: post7.id,
      voteCount: 4,
    },
  })

  await prisma.comment.create({
    data: {
      content: `<p>Both courses are time-intensive! Expect 10-15 hours/week for either one. With 4 other technical courses, you might want to reconsider your schedule or plan to take ML in a lighter semester.</p>`,
      authorId: moderator.id,
      postId: post7.id,
      voteCount: 3,
    },
  })

  // Comments on post8 (LCS)
  await prisma.comment.create({
    data: {
      content: `<p>Here's a step-by-step guide for converting to DP:</p>
<p><strong>1. Table dimensions:</strong> Create a (m+1) x (n+1) table where m and n are the lengths of your strings. The extra row/column is for the base case (empty string).</p>
<p><strong>2. Bottom-up filling:</strong></p>
<pre><code>dp = [[0] * (n+1) for _ in range(m+1)]

for i in range(1, m+1):
    for j in range(1, n+1):
        if X[i-1] == Y[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code></pre>
<p><strong>3. Reconstructing the subsequence:</strong> Start from dp[m][n] and trace back through the table, collecting characters where X[i-1] == Y[j-1].</p>`,
      authorId: users[2].id,
      postId: post8.id,
      voteCount: 6,
      isAccepted: true,
    },
  })

  // Create Votes
  console.log('👍 Creating votes...')
  
  // Votes for posts
  await prisma.vote.createMany({
    data: [
      { userId: users[1].id, postId: post1.id, value: 1 },
      { userId: users[2].id, postId: post1.id, value: 1 },
      { userId: users[3].id, postId: post1.id, value: 1 },
      { userId: moderator.id, postId: post1.id, value: 1 },
      
      { userId: users[0].id, postId: post3.id, value: 1 },
      { userId: users[1].id, postId: post3.id, value: 1 },
      { userId: users[2].id, postId: post3.id, value: 1 },
      { userId: moderator.id, postId: post3.id, value: 1 },
      
      { userId: users[0].id, postId: post4.id, value: 1 },
      { userId: users[2].id, postId: post4.id, value: 1 },
      { userId: users[3].id, postId: post4.id, value: 1 },
      { userId: moderator.id, postId: post4.id, value: 1 },
    ],
  })

  // Votes for comments (on accepted answers)
  await prisma.vote.createMany({
    data: [
      { userId: users[0].id, commentId: comment1_1.id, value: 1 },
      { userId: users[1].id, commentId: comment1_1.id, value: 1 },
      { userId: moderator.id, commentId: comment1_1.id, value: 1 },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: ${users.length + 2} (including admin and moderator)`)
  console.log(`   - Categories: ${categories.length}`)
  console.log(`   - Tags: ${tags.length}`)
  console.log(`   - Posts: 8`)
  console.log(`   - Comments: ~15`)
  console.log(`   - Votes: ~15`)
  console.log('\n🔐 Test credentials:')
  console.log('   - Email: admin@ntua.gr, Password: password123')
  console.log('   - Email: nikolas@ntua.gr, Password: password123')
  console.log('   - Email: george@ntua.gr, Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
