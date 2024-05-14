category_detection_prompt = """
# **Instructions:** Based on the title and the writing provided, identify the category that best describes the type of writing. 
Provide your answer in a JSON format with the key as "category" and the value as the detected category.

**Title Of the Writing:**  {title} 

**Writing:** {writing}

Potential categories (not an exhaustive list, make one if needed):

- Novel 
- Short story
- Novella
- Play or screenplay
- Poetry
- Flash fiction
- Fan fiction
- Children's book
- Graphic novel or comic book
- Biography or autobiography
- Memoir
- College essay
- Personal essay
- Reflective essay
- Argumentative essay
- Travelogue
- Self-help book
- Cookbook
- Guidebook
- True crime
- Historical account or narrative
- Popular science book
- Political or social commentary
- Research paper
- Thesis or dissertation
- Literature review
- Case study
- Technical report
- Journal article
- Conference paper
- White paper
- News article
- Feature story
- Editorial
- Opinion piece
- Investigative report
- Book review
- Film review
- Product review
- Blog post
- Podcast script
- Radio or television script
- Business plan
- Marketing copy
- Advertising script
- Company report
- Proposal
- Resume or CV
- Cover letter
- Executive summary
- Email communication
- Newsletter
- Press release
- Textbook
- Workbook
- Study guide
- Lesson plan
- Educational material or curriculum
- E-learning course content
- Song lyrics
- Personal journal or diary
- Speech or oration
- Greeting card content
- Video game narrative
- Social media post
- Board game instructions

**Your Turn(ONLY REPLY WITH THE JSON AND NOTHING ELSE. THE CATEGORY SHOULD BE 1 to 3 WORDS):**
Category: 
"""
