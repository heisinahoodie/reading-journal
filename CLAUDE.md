@AGENTS.md



<frontend\_aesthetics>

{

&#x20;"cells": \[

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "# Frontend Aesthetics: A Prompting Guide\\n",

&#x20;   "\\n",

&#x20;   "Claude can generate high-quality frontends, but without guidance it tends toward generic, conservative designs. This guide shows you how to prompt Claude to produce more distinctive, polished output."

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## Prompting for Better Outputs\\n",

&#x20;   "\\n",

&#x20;   "Claude has strong knowledge of design principles, typography, and color theory, but defaults to safe choices unless explicitly encouraged otherwise. Through experimentation, we've found three strategies that consistently produce better results:\\n",

&#x20;   "\\n",

&#x20;   "1. \*\*Guide specific design dimensions\*\* - Direct Claude's attention to typography, color, motion, and backgrounds individually\\n",

&#x20;   "2. \*\*Reference design inspirations\*\* - Suggest sources like IDE themes or cultural aesthetics without being overly prescriptive  \\n",

&#x20;   "3. \*\*Call out common defaults\*\* - Explicitly tell Claude to avoid its tendency toward generic choices\\n",

&#x20;   "\\n",

&#x20;   "The prompt below applies these strategies across four key design areas."

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## The Prompt\\n",

&#x20;   "\\n",

&#x20;   "To implement these changes, you can append this prompt section to your system prompt or CLAUDE.md file."

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "code",

&#x20;  "execution\_count": 4,

&#x20;  "metadata": {},

&#x20;  "outputs": \[],

&#x20;  "source": \[

&#x20;   "DISTILLED\_AESTHETICS\_PROMPT = \\"\\"\\"\\n",

&#x20;   "<frontend\_aesthetics>\\n",

&#x20;   "You tend to converge toward generic, \\"on distribution\\" outputs. In frontend design, this creates what users call the \\"AI slop\\" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:\\n",

&#x20;   "\\n",

&#x20;   "Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.\\n",

&#x20;   "\\n",

&#x20;   "Color \& Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.\\n",

&#x20;   "\\n",

&#x20;   "Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.\\n",

&#x20;   "\\n",

&#x20;   "Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.\\n",

&#x20;   "\\n",

&#x20;   "Avoid generic AI-generated aesthetics:\\n",

&#x20;   "- Overused font families (Inter, Roboto, Arial, system fonts)\\n",

&#x20;   "- Clichéd color schemes (particularly purple gradients on white backgrounds)\\n",

&#x20;   "- Predictable layouts and component patterns\\n",

&#x20;   "- Cookie-cutter design that lacks context-specific character\\n",

&#x20;   "\\n",

&#x20;   "Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!\\n",

&#x20;   "</frontend\_aesthetics>\\n",

&#x20;   "\\"\\"\\""

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## Results\\n",

&#x20;   "\\n",

&#x20;   "Here are the results of UI generations both with and without the prompt section above.\\n",

&#x20;   "\\n",

&#x20;   "Without guidance, Claude often defaults to simplistic designs with white and purple backgrounds. With the aesthetics prompt, it produces more varied and visually interesting designs.\\n",

&#x20;   "\\n",

&#x20;   "### Example 1: SaaS Landing Page\\n",

&#x20;   "\*\*Prompt:\*\* `\\"Create a SaaS landing page for a project management tool\\"`\\n",

&#x20;   "\\n",

&#x20;   "<table>\\n",

&#x20;   "<tr>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*Without Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Baseline output without aesthetics guidance](../images/frontend\_aesthetics/baseline\_saas.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*With Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Enhanced output with distilled aesthetics prompt](../images/frontend\_aesthetics/distilled\_saas.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "</tr>\\n",

&#x20;   "</table>\\n",

&#x20;   "\\n",

&#x20;   "### Example 2: Blog Post\\n",

&#x20;   "\*\*Prompt:\*\* `\\"Build a blog post layout with author bio, reading time, and related articles\\"`\\n",

&#x20;   "\\n",

&#x20;   "<table>\\n",

&#x20;   "<tr>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*Without Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Baseline portfolio without aesthetics guidance](../images/frontend\_aesthetics/baseline\_portfolio.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*With Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Enhanced portfolio with distilled aesthetics prompt](../images/frontend\_aesthetics/distilled\_portfolio.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "</tr>\\n",

&#x20;   "</table>\\n",

&#x20;   "\\n",

&#x20;   "### Example 3: Admin Table\\n",

&#x20;   "\*\*Prompt:\*\* `\\"Create an admin panel with a data table showing users, their roles, and action buttons\\"`\\n",

&#x20;   "\\n",

&#x20;   "<table>\\n",

&#x20;   "<tr>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*Without Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Baseline dashboard without aesthetics guidance](../images/frontend\_aesthetics/baseline\_dashboard.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "<td width=\\"50%\\" valign=\\"top\\">\\n",

&#x20;   "\\n",

&#x20;   "\*\*With Aesthetics Prompt\*\*\\n",

&#x20;   "\\n",

&#x20;   "!\[Enhanced dashboard with distilled aesthetics prompt](../images/frontend\_aesthetics/distilled\_dashboard.png)\\n",

&#x20;   "\\n",

&#x20;   "</td>\\n",

&#x20;   "</tr>\\n",

&#x20;   "</table>"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## Try It Yourself\\n",

&#x20;   "\\n",

&#x20;   "First, set up the helper functions:"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "code",

&#x20;  "execution\_count": 2,

&#x20;  "metadata": {},

&#x20;  "outputs": \[],

&#x20;  "source": \[

&#x20;   "import html\\n",

&#x20;   "import os\\n",

&#x20;   "import re\\n",

&#x20;   "import time\\n",

&#x20;   "import webbrowser\\n",

&#x20;   "from datetime import datetime\\n",

&#x20;   "from pathlib import Path\\n",

&#x20;   "\\n",

&#x20;   "from anthropic import Anthropic\\n",

&#x20;   "from IPython.display import HTML as DisplayHTML\\n",

&#x20;   "from IPython.display import display\\n",

&#x20;   "\\n",

&#x20;   "client = Anthropic(api\_key=os.environ.get(\\"ANTHROPIC\_API\_KEY\\"))\\n",

&#x20;   "\\n",

&#x20;   "\\n",

&#x20;   "def save\_html(html\_content):\\n",

&#x20;   "    os.makedirs(\\"html\_outputs\\", exist\_ok=True)\\n",

&#x20;   "    timestamp = datetime.now().strftime(\\"%Y%m%d\_%H%M%S\\")\\n",

&#x20;   "    filepath = f\\"html\_outputs/{timestamp}.html\\"\\n",

&#x20;   "    with open(filepath, \\"w\\") as f:\\n",

&#x20;   "        f.write(html\_content)\\n",

&#x20;   "    return filepath\\n",

&#x20;   "\\n",

&#x20;   "\\n",

&#x20;   "def extract\_html(text):\\n",

&#x20;   "    pattern = r\\"```(?:html)?\\\\s\*(.\*?)\\\\s\*```\\"\\n",

&#x20;   "    matches = re.findall(pattern, text, re.DOTALL)\\n",

&#x20;   "    return matches\[0] if matches else None\\n",

&#x20;   "\\n",

&#x20;   "\\n",

&#x20;   "def open\_in\_browser(filepath):\\n",

&#x20;   "    abs\_path = Path(filepath).resolve()\\n",

&#x20;   "    webbrowser.open(f\\"file://{abs\_path}\\")\\n",

&#x20;   "    print(f\\"🌐 Opened in browser: {filepath}\\")\\n",

&#x20;   "\\n",

&#x20;   "\\n",

&#x20;   "def generate\_html\_with\_claude(system\_prompt, user\_prompt):\\n",

&#x20;   "    print(\\"🚀 Generating HTML...\\\\n\\")\\n",

&#x20;   "\\n",

&#x20;   "    full\_response = \\"\\"\\n",

&#x20;   "    start\_time = time.time()\\n",

&#x20;   "    display\_id = display(DisplayHTML(\\"\\"), display\_id=True)\\n",

&#x20;   "\\n",

&#x20;   "    with client.messages.stream(\\n",

&#x20;   "        model=\\"claude-sonnet-4-6\\",\\n",

&#x20;   "        max\_tokens=64000,\\n",

&#x20;   "        system=system\_prompt,\\n",

&#x20;   "        messages=\[{\\"role\\": \\"user\\", \\"content\\": user\_prompt}],\\n",

&#x20;   "    ) as stream:\\n",

&#x20;   "        for text in stream.text\_stream:\\n",

&#x20;   "            full\_response += text\\n",

&#x20;   "            escaped\_text = html.escape(full\_response)\\n",

&#x20;   "            display\_html = f\\"\\"\\"\\n",

&#x20;   "            <div id=\\"stream-container\\" style=\\"border: 2px solid #667eea; border-radius: 8px; padding: 16px; background: #f8f9fa; max-height: 500px; overflow-y: auto;\\">\\n",

&#x20;   "                <pre style=\\"margin: 0; font-family: monospace; font-size: 12px; color: #2d2d2d; white-space: pre-wrap; word-wrap: break-word;\\">{escaped\_text}</pre>\\n",

&#x20;   "            </div>\\n",

&#x20;   "            <script>\\n",

&#x20;   "                requestAnimationFrame(() => {{\\n",

&#x20;   "                    const container = document.getElementById('stream-container');\\n",

&#x20;   "                    if (container) {{\\n",

&#x20;   "                        container.scrollTop = container.scrollHeight;\\n",

&#x20;   "                    }}\\n",

&#x20;   "                }});\\n",

&#x20;   "            </script>\\n",

&#x20;   "            \\"\\"\\"\\n",

&#x20;   "            display\_id.update(DisplayHTML(display\_html))\\n",

&#x20;   "\\n",

&#x20;   "    elapsed = time.time() - start\_time\\n",

&#x20;   "    escaped\_text = html.escape(full\_response)\\n",

&#x20;   "    final\_html = f\\"\\"\\"\\n",

&#x20;   "    <div style=\\"border: 2px solid #28a745; border-radius: 8px; padding: 16px; background: #f8f9fa; max-height: 500px; overflow-y: auto;\\">\\n",

&#x20;   "        <pre style=\\"margin: 0; font-family: monospace; font-size: 12px; color: #2d2d2d; white-space: pre-wrap; word-wrap: break-word;\\">{escaped\_text}</pre>\\n",

&#x20;   "    </div>\\n",

&#x20;   "    \\"\\"\\"\\n",

&#x20;   "    display\_id.update(DisplayHTML(final\_html))\\n",

&#x20;   "\\n",

&#x20;   "    print(f\\"\\\\n✅ Complete in {elapsed:.1f}s\\\\n\\")\\n",

&#x20;   "\\n",

&#x20;   "    html\_content = extract\_html(full\_response)\\n",

&#x20;   "    if html\_content is None:\\n",

&#x20;   "        print(\\"❌ Error: Could not extract HTML from response.\\")\\n",

&#x20;   "        raise ValueError(\\"Failed to extract HTML from Claude's response.\\")\\n",

&#x20;   "\\n",

&#x20;   "    filepath = save\_html(html\_content)\\n",

&#x20;   "    print(f\\"💾 HTML saved to: {filepath}\\")\\n",

&#x20;   "    open\_in\_browser(filepath)\\n",

&#x20;   "\\n",

&#x20;   "    return filepath"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "Generate with the aesthetics prompt:"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "code",

&#x20;  "execution\_count": 3,

&#x20;  "metadata": {},

&#x20;  "outputs": \[

&#x20;   {

&#x20;    "name": "stdout",

&#x20;    "output\_type": "stream",

&#x20;    "text": \[

&#x20;     "🚀 Generating HTML...\\n",

&#x20;     "\\n"

&#x20;    ]

&#x20;   },

&#x20;   {

&#x20;    "data": {

&#x20;     "text/html": \[

&#x20;      "\\n",

&#x20;      "    <div style=\\"border: 2px solid #28a745; border-radius: 8px; padding: 16px; background: #f8f9fa; max-height: 500px; overflow-y: auto;\\">\\n",

&#x20;      "        <pre style=\\"margin: 0; font-family: monospace; font-size: 12px; color: #2d2d2d; white-space: pre-wrap; word-wrap: break-word;\\">```html\\n",

&#x20;      "\&lt;!DOCTYPE html\&gt;\\n",

&#x20;      "\&lt;html lang=\&quot;en\&quot;\&gt;\\n",

&#x20;      "\&lt;head\&gt;\\n",

&#x20;      "    \&lt;meta charset=\&quot;UTF-8\&quot;\&gt;\\n",

&#x20;      "    \&lt;meta name=\&quot;viewport\&quot; content=\&quot;width=device-width, initial-scale=1.0\&quot;\&gt;\\n",

&#x20;      "    \&lt;title\&gt;Momentum — Project Management Reimagined\&lt;/title\&gt;\\n",

&#x20;      "    \&lt;script src=\&quot;https://cdn.tailwindcss.com\&quot;\&gt;\&lt;/script\&gt;\\n",

&#x20;      "    \&lt;link rel=\&quot;preconnect\&quot; href=\&quot;https://fonts.googleapis.com\&quot;\&gt;\\n",

&#x20;      "    \&lt;link rel=\&quot;preconnect\&quot; href=\&quot;https://fonts.gstatic.com\&quot; crossorigin\&gt;\\n",

&#x20;      "    \&lt;link href=\&quot;https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800\&amp;family=DM+Sans:wght@400;500;700\&amp;display=swap\&quot; rel=\&quot;stylesheet\&quot;\&gt;\\n",

&#x20;      "    \&lt;style\&gt;\\n",

&#x20;      "        :root {\\n",

&#x20;      "            --primary: #FF6B35;\\n",

&#x20;      "            --primary-dark: #E85A2A;\\n",

&#x20;      "            --secondary: #004E89;\\n",

&#x20;      "            --accent: #FFD23F;\\n",

&#x20;      "            --dark: #1A1A2E;\\n",

&#x20;      "            --light: #F8F9FA;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        \* {\\n",

&#x20;      "            margin: 0;\\n",

&#x20;      "            padding: 0;\\n",

&#x20;      "            box-sizing: border-box;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        body {\\n",

&#x20;      "            font-family: \&#x27;DM Sans\&#x27;, sans-serif;\\n",

&#x20;      "            background: var(--light);\\n",

&#x20;      "            color: var(--dark);\\n",

&#x20;      "            overflow-x: hidden;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        h1, h2, h3, h4 {\\n",

&#x20;      "            font-family: \&#x27;Syne\&#x27;, sans-serif;\\n",

&#x20;      "            font-weight: 800;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Animated background \*/\\n",

&#x20;      "        .hero-bg {\\n",

&#x20;      "            position: absolute;\\n",

&#x20;      "            top: 0;\\n",

&#x20;      "            left: 0;\\n",

&#x20;      "            width: 100%;\\n",

&#x20;      "            height: 100%;\\n",

&#x20;      "            background: linear-gradient(135deg, #004E89 0%, #1A1A2E 50%, #FF6B35 100%);\\n",

&#x20;      "            z-index: 0;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .hero-bg::before {\\n",

&#x20;      "            content: \&#x27;\&#x27;;\\n",

&#x20;      "            position: absolute;\\n",

&#x20;      "            width: 200%;\\n",

&#x20;      "            height: 200%;\\n",

&#x20;      "            background: \\n",

&#x20;      "                radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),\\n",

&#x20;      "                radial-gradient(circle at 80% 80%, rgba(255, 210, 63, 0.2) 0%, transparent 50%),\\n",

&#x20;      "                radial-gradient(circle at 40% 20%, rgba(0, 78, 137, 0.3) 0%, transparent 50%);\\n",

&#x20;      "            animation: float 20s ease-in-out infinite;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        @keyframes float {\\n",

&#x20;      "            0%, 100% { transform: translate(0, 0) rotate(0deg); }\\n",

&#x20;      "            33% { transform: translate(30px, -30px) rotate(120deg); }\\n",

&#x20;      "            66% { transform: translate(-20px, 20px) rotate(240deg); }\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .mesh-gradient {\\n",

&#x20;      "            background: \\n",

&#x20;      "                radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0px, transparent 50%),\\n",

&#x20;      "                radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0px, transparent 50%),\\n",

&#x20;      "                radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.3) 0px, transparent 50%),\\n",

&#x20;      "                radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.2) 0px, transparent 50%);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Fade in animations \*/\\n",

&#x20;      "        .fade-in {\\n",

&#x20;      "            opacity: 0;\\n",

&#x20;      "            transform: translateY(30px);\\n",

&#x20;      "            animation: fadeInUp 0.8s ease forwards;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        @keyframes fadeInUp {\\n",

&#x20;      "            to {\\n",

&#x20;      "                opacity: 1;\\n",

&#x20;      "                transform: translateY(0);\\n",

&#x20;      "            }\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .delay-1 { animation-delay: 0.1s; }\\n",

&#x20;      "        .delay-2 { animation-delay: 0.2s; }\\n",

&#x20;      "        .delay-3 { animation-delay: 0.3s; }\\n",

&#x20;      "        .delay-4 { animation-delay: 0.4s; }\\n",

&#x20;      "        .delay-5 { animation-delay: 0.5s; }\\n",

&#x20;      "        .delay-6 { animation-delay: 0.6s; }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Feature cards \*/\\n",

&#x20;      "        .feature-card {\\n",

&#x20;      "            background: white;\\n",

&#x20;      "            border-radius: 24px;\\n",

&#x20;      "            padding: 2rem;\\n",

&#x20;      "            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\\n",

&#x20;      "            border: 2px solid transparent;\\n",

&#x20;      "            position: relative;\\n",

&#x20;      "            overflow: hidden;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .feature-card::before {\\n",

&#x20;      "            content: \&#x27;\&#x27;;\\n",

&#x20;      "            position: absolute;\\n",

&#x20;      "            top: 0;\\n",

&#x20;      "            left: 0;\\n",

&#x20;      "            width: 100%;\\n",

&#x20;      "            height: 4px;\\n",

&#x20;      "            background: linear-gradient(90deg, var(--primary), var(--accent));\\n",

&#x20;      "            transform: scaleX(0);\\n",

&#x20;      "            transform-origin: left;\\n",

&#x20;      "            transition: transform 0.4s ease;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .feature-card:hover::before {\\n",

&#x20;      "            transform: scaleX(1);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .feature-card:hover {\\n",

&#x20;      "            transform: translateY(-8px);\\n",

&#x20;      "            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);\\n",

&#x20;      "            border-color: var(--primary);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* CTA Button \*/\\n",

&#x20;      "        .cta-button {\\n",

&#x20;      "            background: var(--primary);\\n",

&#x20;      "            color: white;\\n",

&#x20;      "            padding: 1rem 2.5rem;\\n",

&#x20;      "            border-radius: 50px;\\n",

&#x20;      "            font-weight: 700;\\n",

&#x20;      "            text-decoration: none;\\n",

&#x20;      "            display: inline-block;\\n",

&#x20;      "            transition: all 0.3s ease;\\n",

&#x20;      "            box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);\\n",

&#x20;      "            position: relative;\\n",

&#x20;      "            overflow: hidden;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .cta-button::before {\\n",

&#x20;      "            content: \&#x27;\&#x27;;\\n",

&#x20;      "            position: absolute;\\n",

&#x20;      "            top: 50%;\\n",

&#x20;      "            left: 50%;\\n",

&#x20;      "            width: 0;\\n",

&#x20;      "            height: 0;\\n",

&#x20;      "            border-radius: 50%;\\n",

&#x20;      "            background: rgba(255, 255, 255, 0.2);\\n",

&#x20;      "            transform: translate(-50%, -50%);\\n",

&#x20;      "            transition: width 0.6s, height 0.6s;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .cta-button:hover::before {\\n",

&#x20;      "            width: 300px;\\n",

&#x20;      "            height: 300px;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .cta-button:hover {\\n",

&#x20;      "            transform: translateY(-2px);\\n",

&#x20;      "            box-shadow: 0 15px 40px rgba(255, 107, 53, 0.4);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .cta-button span {\\n",

&#x20;      "            position: relative;\\n",

&#x20;      "            z-index: 1;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Stats counter animation \*/\\n",

&#x20;      "        .stat-number {\\n",

&#x20;      "            font-size: 3rem;\\n",

&#x20;      "            font-weight: 800;\\n",

&#x20;      "            background: linear-gradient(135deg, var(--primary), var(--accent));\\n",

&#x20;      "            -webkit-background-clip: text;\\n",

&#x20;      "            -webkit-text-fill-color: transparent;\\n",

&#x20;      "            background-clip: text;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Testimonial cards \*/\\n",

&#x20;      "        .testimonial {\\n",

&#x20;      "            background: white;\\n",

&#x20;      "            padding: 2rem;\\n",

&#x20;      "            border-radius: 20px;\\n",

&#x20;      "            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);\\n",

&#x20;      "            transition: transform 0.3s ease;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .testimonial:hover {\\n",

&#x20;      "            transform: scale(1.02);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Icon styles \*/\\n",

&#x20;      "        .icon-circle {\\n",

&#x20;      "            width: 60px;\\n",

&#x20;      "            height: 60px;\\n",

&#x20;      "            border-radius: 50%;\\n",

&#x20;      "            display: flex;\\n",

&#x20;      "            align-items: center;\\n",

&#x20;      "            justify-content: center;\\n",

&#x20;      "            font-size: 24px;\\n",

&#x20;      "            margin-bottom: 1rem;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Navbar scroll effect \*/\\n",

&#x20;      "        .navbar {\\n",

&#x20;      "            transition: all 0.3s ease;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .navbar.scrolled {\\n",

&#x20;      "            background: rgba(255, 255, 255, 0.95);\\n",

&#x20;      "            backdrop-filter: blur(10px);\\n",

&#x20;      "            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Pricing cards \*/\\n",

&#x20;      "        .pricing-card {\\n",

&#x20;      "            background: white;\\n",

&#x20;      "            border-radius: 24px;\\n",

&#x20;      "            padding: 3rem 2rem;\\n",

&#x20;      "            transition: all 0.4s ease;\\n",

&#x20;      "            border: 2px solid #e5e7eb;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .pricing-card.featured {\\n",

&#x20;      "            border-color: var(--primary);\\n",

&#x20;      "            transform: scale(1.05);\\n",

&#x20;      "            box-shadow: 0 20px 60px rgba(255, 107, 53, 0.2);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .pricing-card:hover {\\n",

&#x20;      "            transform: translateY(-10px) scale(1.02);\\n",

&#x20;      "            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        /\* Dashboard mockup \*/\\n",

&#x20;      "        .dashboard-mockup {\\n",

&#x20;      "            background: white;\\n",

&#x20;      "            border-radius: 20px;\\n",

&#x20;      "            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);\\n",

&#x20;      "            padding: 1rem;\\n",

&#x20;      "            position: relative;\\n",

&#x20;      "            transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);\\n",

&#x20;      "            transition: transform 0.5s ease;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .dashboard-mockup:hover {\\n",

&#x20;      "            transform: perspective(1000px) rotateY(0deg) rotateX(0deg);\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .mockup-header {\\n",

&#x20;      "            display: flex;\\n",

&#x20;      "            gap: 8px;\\n",

&#x20;      "            margin-bottom: 1rem;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .mockup-dot {\\n",

&#x20;      "            width: 12px;\\n",

&#x20;      "            height: 12px;\\n",

&#x20;      "            border-radius: 50%;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .mockup-content {\\n",

&#x20;      "            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);\\n",

&#x20;      "            border-radius: 12px;\\n",

&#x20;      "            height: 400px;\\n",

&#x20;      "            position: relative;\\n",

&#x20;      "            overflow: hidden;\\n",

&#x20;      "        }\\n",

&#x20;      "\\n",

&#x20;      "        .mockup-element {\\n",

&#x20;      "            position: absolute;\\n",

&#x20;      "            background: white;\\n",

&#x20;      "            border-radius: 8px;\\n",

&#x20;      "            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\\n",

&#x20;      "        }\\n",

&#x20;      "    \&lt;/style\&gt;\\n",

&#x20;      "\&lt;/head\&gt;\\n",

&#x20;      "\&lt;body\&gt;\\n",

&#x20;      "    \&lt;!-- Navigation --\&gt;\\n",

&#x20;      "    \&lt;nav class=\&quot;navbar fixed w-full top-0 z-50 py-4 px-8\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto flex items-center justify-between\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center\&quot;\&gt;\\n",

&#x20;      "                    \&lt;span class=\&quot;text-white font-bold text-xl\&quot;\&gt;M\&lt;/span\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;span class=\&quot;text-2xl font-bold\&quot;\&gt;Momentum\&lt;/span\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;hidden md:flex items-center gap-8\&quot;\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#features\&quot; class=\&quot;text-gray-700 hover:text-orange-500 transition font-medium\&quot;\&gt;Features\&lt;/a\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#pricing\&quot; class=\&quot;text-gray-700 hover:text-orange-500 transition font-medium\&quot;\&gt;Pricing\&lt;/a\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#testimonials\&quot; class=\&quot;text-gray-700 hover:text-orange-500 transition font-medium\&quot;\&gt;Testimonials\&lt;/a\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#\&quot; class=\&quot;text-gray-700 hover:text-orange-500 transition font-medium\&quot;\&gt;Login\&lt;/a\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#\&quot; class=\&quot;cta-button\&quot;\&gt;\&lt;span\&gt;Start Free Trial\&lt;/span\&gt;\&lt;/a\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;button class=\&quot;md:hidden text-gray-700\&quot;\&gt;\\n",

&#x20;      "                \&lt;svg width=\&quot;24\&quot; height=\&quot;24\&quot; fill=\&quot;none\&quot; stroke=\&quot;currentColor\&quot; stroke-width=\&quot;2\&quot; stroke-linecap=\&quot;round\&quot; stroke-linejoin=\&quot;round\&quot;\&gt;\\n",

&#x20;      "                    \&lt;line x1=\&quot;3\&quot; y1=\&quot;12\&quot; x2=\&quot;21\&quot; y2=\&quot;12\&quot;\&gt;\&lt;/line\&gt;\\n",

&#x20;      "                    \&lt;line x1=\&quot;3\&quot; y1=\&quot;6\&quot; x2=\&quot;21\&quot; y2=\&quot;6\&quot;\&gt;\&lt;/line\&gt;\\n",

&#x20;      "                    \&lt;line x1=\&quot;3\&quot; y1=\&quot;18\&quot; x2=\&quot;21\&quot; y2=\&quot;18\&quot;\&gt;\&lt;/line\&gt;\\n",

&#x20;      "                \&lt;/svg\&gt;\\n",

&#x20;      "            \&lt;/button\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/nav\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Hero Section --\&gt;\\n",

&#x20;      "    \&lt;section class=\&quot;relative min-h-screen flex items-center justify-center overflow-hidden pt-20\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;hero-bg\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "        \\n",

&#x20;      "        \&lt;div class=\&quot;relative z-10 max-w-7xl mx-auto px-8 py-20\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;grid md:grid-cols-2 gap-12 items-center\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-white\&quot;\&gt;\\n",

&#x20;      "                    \&lt;h1 class=\&quot;text-6xl md:text-7xl leading-tight mb-6 fade-in\&quot;\&gt;\\n",

&#x20;      "                        Build momentum.\&lt;br/\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-yellow-300\&quot;\&gt;Ship faster.\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/h1\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-xl mb-8 text-gray-200 fade-in delay-1\&quot;\&gt;\\n",

&#x20;      "                        The project management tool that adapts to your team\&#x27;s rhythm. Stop managing tasks. Start building momentum.\\n",

&#x20;      "                    \&lt;/p\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex flex-wrap gap-4 fade-in delay-2\&quot;\&gt;\\n",

&#x20;      "                        \&lt;a href=\&quot;#\&quot; class=\&quot;cta-button\&quot;\&gt;\&lt;span\&gt;Get Started Free\&lt;/span\&gt;\&lt;/a\&gt;\\n",

&#x20;      "                        \&lt;a href=\&quot;#\&quot; class=\&quot;bg-white/10 backdrop-blur text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition inline-block\&quot;\&gt;\\n",

&#x20;      "                            Watch Demo\\n",

&#x20;      "                        \&lt;/a\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-8 mt-12 fade-in delay-3\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;stat-number text-white\&quot;\&gt;50k+\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-gray-300\&quot;\&gt;Active Teams\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;stat-number text-white\&quot;\&gt;4.9\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-gray-300\&quot;\&gt;Average Rating\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;stat-number text-white\&quot;\&gt;99%\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-gray-300\&quot;\&gt;Uptime\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \\n",

&#x20;      "                \&lt;div class=\&quot;fade-in delay-4\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;dashboard-mockup\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;mockup-header\&quot;\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-dot bg-red-500\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-dot bg-yellow-400\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-dot bg-green-500\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;mockup-content\&quot;\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-element\&quot; style=\&quot;top: 20px; left: 20px; width: 200px; height: 60px;\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-element\&quot; style=\&quot;top: 100px; left: 20px; width: 150px; height: 100px;\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-element\&quot; style=\&quot;top: 100px; right: 20px; width: 150px; height: 100px;\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-element\&quot; style=\&quot;top: 220px; left: 20px; width: 320px; height: 80px;\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;mockup-element\&quot; style=\&quot;bottom: 20px; right: 20px; width: 100px; height: 60px; background: linear-gradient(135deg, #FF6B35, #FFD23F);\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Features Section --\&gt;\\n",

&#x20;      "    \&lt;section id=\&quot;features\&quot; class=\&quot;py-32 px-8 bg-white\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;text-center mb-20\&quot;\&gt;\\n",

&#x20;      "                \&lt;h2 class=\&quot;text-5xl md:text-6xl font-bold mb-6\&quot;\&gt;Everything you need.\&lt;br/\&gt;Nothing you don\&#x27;t.\&lt;/h2\&gt;\\n",

&#x20;      "                \&lt;p class=\&quot;text-xl text-gray-600 max-w-2xl mx-auto\&quot;\&gt;Powerful features that don\&#x27;t get in your way. Built for teams who want to focus on work, not tools.\&lt;/p\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "            \&lt;div class=\&quot;grid md:grid-cols-3 gap-8\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-orange-100 text-orange-500\&quot;\&gt;⚡\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Lightning Fast\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;Native performance across all devices. No lag, no loading spinners. Just instant productivity.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-blue-100 text-blue-500\&quot;\&gt;🎯\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Smart Workflows\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;AI-powered automation that learns from your team\&#x27;s patterns and suggests optimizations.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-purple-100 text-purple-500\&quot;\&gt;🔗\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Seamless Integration\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;Connect with 1000+ tools your team already uses. Slack, GitHub, Figma, and more.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-green-100 text-green-500\&quot;\&gt;📊\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Real-time Analytics\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;Visualize progress with beautiful dashboards that update in real-time as work happens.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-pink-100 text-pink-500\&quot;\&gt;🎨\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Customizable Views\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;Board, list, timeline, calendar - switch between views instantly. See work your way.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;feature-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;icon-circle bg-yellow-100 text-yellow-600\&quot;\&gt;🔒\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;h3 class=\&quot;text-2xl font-bold mb-4\&quot;\&gt;Enterprise Security\&lt;/h3\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-600\&quot;\&gt;SOC 2 Type II certified. Your data encrypted at rest and in transit. Always.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Social Proof / Stats --\&gt;\\n",

&#x20;      "    \&lt;section class=\&quot;py-24 px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;text-center mb-16\&quot;\&gt;\\n",

&#x20;      "                \&lt;h2 class=\&quot;text-4xl md:text-5xl font-bold mb-4\&quot;\&gt;Trusted by teams worldwide\&lt;/h2\&gt;\\n",

&#x20;      "                \&lt;p class=\&quot;text-xl text-gray-300\&quot;\&gt;Join thousands of companies building better products\&lt;/p\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "            \\n",

&#x20;      "            \&lt;div class=\&quot;grid grid-cols-2 md:grid-cols-4 gap-8 mb-16\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-center\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-5xl font-bold mb-2 text-yellow-400\&quot;\&gt;2.5M+\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-gray-400\&quot;\&gt;Projects Created\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-center\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-5xl font-bold mb-2 text-yellow-400\&quot;\&gt;50K+\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-gray-400\&quot;\&gt;Active Teams\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-center\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-5xl font-bold mb-2 text-yellow-400\&quot;\&gt;150+\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-gray-400\&quot;\&gt;Countries\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-center\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-5xl font-bold mb-2 text-yellow-400\&quot;\&gt;99.9%\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-gray-400\&quot;\&gt;Uptime SLA\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "            \&lt;div class=\&quot;flex flex-wrap justify-center items-center gap-12 opacity-60\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-3xl font-bold\&quot;\&gt;Stripe\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-3xl font-bold\&quot;\&gt;Notion\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-3xl font-bold\&quot;\&gt;Figma\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-3xl font-bold\&quot;\&gt;Webflow\&lt;/div\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;text-3xl font-bold\&quot;\&gt;Linear\&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Testimonials --\&gt;\\n",

&#x20;      "    \&lt;section id=\&quot;testimonials\&quot; class=\&quot;py-32 px-8 bg-gray-50\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;text-center mb-20\&quot;\&gt;\\n",

&#x20;      "                \&lt;h2 class=\&quot;text-5xl font-bold mb-6\&quot;\&gt;Loved by teams everywhere\&lt;/h2\&gt;\\n",

&#x20;      "                \&lt;p class=\&quot;text-xl text-gray-600\&quot;\&gt;Don\&#x27;t just take our word for it\&lt;/p\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "            \&lt;div class=\&quot;grid md:grid-cols-3 gap-8\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;testimonial\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-1 mb-4\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-yellow-400 text-xl\&quot;\&gt;★★★★★\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-700 mb-6\&quot;\&gt;\&quot;Momentum completely changed how our team works. We shipped our last feature 40% faster than usual. The automation is brilliant.\&quot;\&lt;/p\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-3\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;font-bold\&quot;\&gt;Sarah Chen\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-sm text-gray-500\&quot;\&gt;Head of Product, TechCorp\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;testimonial\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-1 mb-4\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-yellow-400 text-xl\&quot;\&gt;★★★★★\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-700 mb-6\&quot;\&gt;\&quot;Finally, a project management tool that doesn\&#x27;t feel like homework. Our team adoption rate was 100% in the first week.\&quot;\&lt;/p\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-3\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;font-bold\&quot;\&gt;Marcus Rodriguez\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-sm text-gray-500\&quot;\&gt;Engineering Manager, StartupXYZ\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;testimonial\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-1 mb-4\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-yellow-400 text-xl\&quot;\&gt;★★★★★\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-700 mb-6\&quot;\&gt;\&quot;The real-time collaboration features are next level. It\&#x27;s like Google Docs, but for project management. Game changer.\&quot;\&lt;/p\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-3\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400\&quot;\&gt;\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;font-bold\&quot;\&gt;Aisha Patel\&lt;/div\&gt;\\n",

&#x20;      "                            \&lt;div class=\&quot;text-sm text-gray-500\&quot;\&gt;Design Lead, CreativeStudio\&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Pricing --\&gt;\\n",

&#x20;      "    \&lt;section id=\&quot;pricing\&quot; class=\&quot;py-32 px-8 bg-white\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;text-center mb-20\&quot;\&gt;\\n",

&#x20;      "                \&lt;h2 class=\&quot;text-5xl md:text-6xl font-bold mb-6\&quot;\&gt;Simple, transparent pricing\&lt;/h2\&gt;\\n",

&#x20;      "                \&lt;p class=\&quot;text-xl text-gray-600\&quot;\&gt;No hidden fees. Cancel anytime. Start with a 14-day free trial.\&lt;/p\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "            \&lt;div class=\&quot;grid md:grid-cols-3 gap-8 max-w-6xl mx-auto\&quot;\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;pricing-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-sm font-bold text-gray-500 mb-2\&quot;\&gt;STARTER\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;mb-6\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-5xl font-bold\&quot;\&gt;$12\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-gray-500\&quot;\&gt;/user/month\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-4 mb-8\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Up to 10 team members\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Unlimited projects\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Basic integrations\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;5GB storage\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;block text-center bg-gray-900 text-white py-3 rounded-full font-bold hover:bg-gray-800 transition\&quot;\&gt;\\n",

&#x20;      "                        Start Free Trial\\n",

&#x20;      "                    \&lt;/a\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;pricing-card featured\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-sm font-bold text-orange-500 mb-2\&quot;\&gt;PROFESSIONAL\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;mb-6\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-5xl font-bold\&quot;\&gt;$29\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-gray-500\&quot;\&gt;/user/month\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-4 mb-8\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Unlimited team members\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Advanced automation\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;All integrations\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;100GB storage\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Priority support\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;block text-center bg-orange-500 text-white py-3 rounded-full font-bold hover:bg-orange-600 transition\&quot;\&gt;\\n",

&#x20;      "                        Start Free Trial\\n",

&#x20;      "                    \&lt;/a\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "\\n",

&#x20;      "                \&lt;div class=\&quot;pricing-card\&quot;\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;text-sm font-bold text-gray-500 mb-2\&quot;\&gt;ENTERPRISE\&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;mb-6\&quot;\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-5xl font-bold\&quot;\&gt;Custom\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-4 mb-8\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Everything in Pro\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Advanced security\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Custom integrations\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Unlimited storage\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li class=\&quot;flex items-center gap-2\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-green-500\&quot;\&gt;✓\&lt;/span\&gt;\\n",

&#x20;      "                            \&lt;span\&gt;Dedicated support\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;block text-center bg-gray-900 text-white py-3 rounded-full font-bold hover:bg-gray-800 transition\&quot;\&gt;\\n",

&#x20;      "                        Contact Sales\\n",

&#x20;      "                    \&lt;/a\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- CTA Section --\&gt;\\n",

&#x20;      "    \&lt;section class=\&quot;py-32 px-8 bg-gradient-to-br from-orange-500 to-yellow-400 text-white\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-4xl mx-auto text-center\&quot;\&gt;\\n",

&#x20;      "            \&lt;h2 class=\&quot;text-5xl md:text-6xl font-bold mb-6\&quot;\&gt;Ready to build momentum?\&lt;/h2\&gt;\\n",

&#x20;      "            \&lt;p class=\&quot;text-2xl mb-12 text-white/90\&quot;\&gt;Join 50,000+ teams shipping faster with Momentum\&lt;/p\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;flex flex-wrap gap-4 justify-center\&quot;\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#\&quot; class=\&quot;bg-white text-orange-500 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition inline-block\&quot;\&gt;\\n",

&#x20;      "                    Start Free Trial\\n",

&#x20;      "                \&lt;/a\&gt;\\n",

&#x20;      "                \&lt;a href=\&quot;#\&quot; class=\&quot;bg-white/10 backdrop-blur text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition inline-block\&quot;\&gt;\\n",

&#x20;      "                    Schedule Demo\\n",

&#x20;      "                \&lt;/a\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;p class=\&quot;mt-8 text-white/80\&quot;\&gt;No credit card required • 14-day free trial • Cancel anytime\&lt;/p\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/section\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;!-- Footer --\&gt;\\n",

&#x20;      "    \&lt;footer class=\&quot;bg-gray-900 text-white py-16 px-8\&quot;\&gt;\\n",

&#x20;      "        \&lt;div class=\&quot;max-w-7xl mx-auto\&quot;\&gt;\\n",

&#x20;      "            \&lt;div class=\&quot;grid md:grid-cols-4 gap-12 mb-12\&quot;\&gt;\\n",

&#x20;      "                \&lt;div\&gt;\\n",

&#x20;      "                    \&lt;div class=\&quot;flex items-center gap-2 mb-4\&quot;\&gt;\\n",

&#x20;      "                        \&lt;div class=\&quot;w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center\&quot;\&gt;\\n",

&#x20;      "                            \&lt;span class=\&quot;text-white font-bold text-xl\&quot;\&gt;M\&lt;/span\&gt;\\n",

&#x20;      "                        \&lt;/div\&gt;\\n",

&#x20;      "                        \&lt;span class=\&quot;text-2xl font-bold\&quot;\&gt;Momentum\&lt;/span\&gt;\\n",

&#x20;      "                    \&lt;/div\&gt;\\n",

&#x20;      "                    \&lt;p class=\&quot;text-gray-400\&quot;\&gt;Building momentum for teams that ship.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \\n",

&#x20;      "                \&lt;div\&gt;\\n",

&#x20;      "                    \&lt;h4 class=\&quot;font-bold mb-4\&quot;\&gt;Product\&lt;/h4\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-2 text-gray-400\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Features\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Pricing\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Integrations\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Changelog\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \\n",

&#x20;      "                \&lt;div\&gt;\\n",

&#x20;      "                    \&lt;h4 class=\&quot;font-bold mb-4\&quot;\&gt;Company\&lt;/h4\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-2 text-gray-400\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;About\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Blog\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Careers\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Contact\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "                \\n",

&#x20;      "                \&lt;div\&gt;\\n",

&#x20;      "                    \&lt;h4 class=\&quot;font-bold mb-4\&quot;\&gt;Legal\&lt;/h4\&gt;\\n",

&#x20;      "                    \&lt;ul class=\&quot;space-y-2 text-gray-400\&quot;\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Privacy\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Terms\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;Security\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                        \&lt;li\&gt;\&lt;a href=\&quot;#\&quot; class=\&quot;hover:text-white transition\&quot;\&gt;GDPR\&lt;/a\&gt;\&lt;/li\&gt;\\n",

&#x20;      "                    \&lt;/ul\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "            \\n",

&#x20;      "            \&lt;div class=\&quot;border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4\&quot;\&gt;\\n",

&#x20;      "                \&lt;p class=\&quot;text-gray-400\&quot;\&gt;© 2024 Momentum. All rights reserved.\&lt;/p\&gt;\\n",

&#x20;      "                \&lt;div class=\&quot;flex gap-6\&quot;\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;text-gray-400 hover:text-white transition\&quot;\&gt;Twitter\&lt;/a\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;text-gray-400 hover:text-white transition\&quot;\&gt;LinkedIn\&lt;/a\&gt;\\n",

&#x20;      "                    \&lt;a href=\&quot;#\&quot; class=\&quot;text-gray-400 hover:text-white transition\&quot;\&gt;GitHub\&lt;/a\&gt;\\n",

&#x20;      "                \&lt;/div\&gt;\\n",

&#x20;      "            \&lt;/div\&gt;\\n",

&#x20;      "        \&lt;/div\&gt;\\n",

&#x20;      "    \&lt;/footer\&gt;\\n",

&#x20;      "\\n",

&#x20;      "    \&lt;script\&gt;\\n",

&#x20;      "        // Navbar scroll effect\\n",

&#x20;      "        const navbar = document.querySelector(\&#x27;.navbar\&#x27;);\\n",

&#x20;      "        window.addEventListener(\&#x27;scroll\&#x27;, () =\&gt; {\\n",

&#x20;      "            if (window.scrollY \&gt; 50) {\\n",

&#x20;      "                navbar.classList.add(\&#x27;scrolled\&#x27;);\\n",

&#x20;      "            } else {\\n",

&#x20;      "                navbar.classList.remove(\&#x27;scrolled\&#x27;);\\n",

&#x20;      "            }\\n",

&#x20;      "        });\\n",

&#x20;      "\\n",

&#x20;      "        // Smooth scroll for anchor links\\n",

&#x20;      "        document.querySelectorAll(\&#x27;a\[href^=\&quot;#\&quot;]\&#x27;).forEach(anchor =\&gt; {\\n",

&#x20;      "            anchor.addEventListener(\&#x27;click\&#x27;, function (e) {\\n",

&#x20;      "                e.preventDefault();\\n",

&#x20;      "                const target = document.querySelector(this.getAttribute(\&#x27;href\&#x27;));\\n",

&#x20;      "                if (target) {\\n",

&#x20;      "                    target.scrollIntoView({\\n",

&#x20;      "                        behavior: \&#x27;smooth\&#x27;,\\n",

&#x20;      "                        block: \&#x27;start\&#x27;\\n",

&#x20;      "                    });\\n",

&#x20;      "                }\\n",

&#x20;      "            });\\n",

&#x20;      "        });\\n",

&#x20;      "\\n",

&#x20;      "        // Intersection Observer for fade-in animations\\n",

&#x20;      "        const observerOptions = {\\n",

&#x20;      "            threshold: 0.1,\\n",

&#x20;      "            rootMargin: \&#x27;0px 0px -50px 0px\&#x27;\\n",

&#x20;      "        };\\n",

&#x20;      "\\n",

&#x20;      "        const observer = new IntersectionObserver((entries) =\&gt; {\\n",

&#x20;      "            entries.forEach(entry =\&gt; {\\n",

&#x20;      "                if (entry.isIntersecting) {\\n",

&#x20;      "                    entry.target.style.opacity = \&#x27;1\&#x27;;\\n",

&#x20;      "                    entry.target.style.transform = \&#x27;translateY(0)\&#x27;;\\n",

&#x20;      "                }\\n",

&#x20;      "            });\\n",

&#x20;      "        }, observerOptions);\\n",

&#x20;      "\\n",

&#x20;      "        document.querySelectorAll(\&#x27;.feature-card, .testimonial, .pricing-card\&#x27;).forEach(el =\&gt; {\\n",

&#x20;      "            el.style.opacity = \&#x27;0\&#x27;;\\n",

&#x20;      "            el.style.transform = \&#x27;translateY(30px)\&#x27;;\\n",

&#x20;      "            el.style.transition = \&#x27;opacity 0.6s ease, transform 0.6s ease\&#x27;;\\n",

&#x20;      "            observer.observe(el);\\n",

&#x20;      "        });\\n",

&#x20;      "    \&lt;/script\&gt;\\n",

&#x20;      "\&lt;/body\&gt;\\n",

&#x20;      "\&lt;/html\&gt;\\n",

&#x20;      "```</pre>\\n",

&#x20;      "    </div>\\n",

&#x20;      "    "

&#x20;     ],

&#x20;     "text/plain": \[

&#x20;      "<IPython.core.display.HTML object>"

&#x20;     ]

&#x20;    },

&#x20;    "metadata": {},

&#x20;    "output\_type": "display\_data"

&#x20;   },

&#x20;   {

&#x20;    "name": "stdout",

&#x20;    "output\_type": "stream",

&#x20;    "text": \[

&#x20;     "\\n",

&#x20;     "✅ Complete in 98.2s\\n",

&#x20;     "\\n",

&#x20;     "💾 HTML saved to: html\_outputs/20251021\_101010.html\\n",

&#x20;     "🌐 Opened in browser: html\_outputs/20251021\_101010.html\\n"

&#x20;    ]

&#x20;   },

&#x20;   {

&#x20;    "data": {

&#x20;     "text/plain": \[

&#x20;      "'html\_outputs/20251021\_101010.html'"

&#x20;     ]

&#x20;    },

&#x20;    "execution\_count": 3,

&#x20;    "metadata": {},

&#x20;    "output\_type": "execute\_result"

&#x20;   }

&#x20;  ],

&#x20;  "source": \[

&#x20;   "BASE\_SYSTEM\_PROMPT = \\"\\"\\"\\n",

&#x20;   "You are an expert frontend engineer skilled at crafting beautiful, performant frontend applications.\\n",

&#x20;   "\\n",

&#x20;   "<tech\_stack>\\n",

&#x20;   "Use vanilla HTML, CSS, \& Javascript. Use Tailwind CSS for your CSS variables.\\n",

&#x20;   "</tech\_stack>\\n",

&#x20;   "\\n",

&#x20;   "<output>\\n",

&#x20;   "Generate complete, self-contained HTML code for the requested frontend application. Include all CSS and JavaScript inline.\\n",

&#x20;   "\\n",

&#x20;   "CRITICAL: You must wrap your HTML code in triple backticks with html language identifier like this:\\n",

&#x20;   "```html\\n",

&#x20;   "<!DOCTYPE html>\\n",

&#x20;   "<html>\\n",

&#x20;   "...\\n",

&#x20;   "</html>\\n",

&#x20;   "```\\n",

&#x20;   "\\n",

&#x20;   "Our parser depends on this format - do not deviate from it!\\n",

&#x20;   "</output>\\n",

&#x20;   "\\"\\"\\"\\n",

&#x20;   "\\n",

&#x20;   "USER\_PROMPT = \\"Create a SaaS landing page for a project management tool\\"\\n",

&#x20;   "\\n",

&#x20;   "# Generate with distilled aesthetics prompt\\n",

&#x20;   "generate\_html\_with\_claude(BASE\_SYSTEM\_PROMPT + \\"\\\\n\\\\n\\" + DISTILLED\_AESTHETICS\_PROMPT, USER\_PROMPT)"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## Isolated Prompting\\n",

&#x20;   "\\n",

&#x20;   "The full aesthetics prompt works well for general use, but sometimes you want targeted control. You can isolate specific dimensions (typography, color, motion) or lock in a particular theme. This gives you faster generation times and more predictable outputs.\\n",

&#x20;   "\\n",

&#x20;   "### Example 1: Typography Only\\n",

&#x20;   "\\n",

&#x20;   "Isolate a single design dimension when you want to improve one aspect without changing others:"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "code",

&#x20;  "execution\_count": null,

&#x20;  "metadata": {},

&#x20;  "outputs": \[],

&#x20;  "source": \[

&#x20;   "TYPOGRAPHY\_PROMPT = \\"\\"\\"\\n",

&#x20;   "<use\_interesting\_fonts>\\n",

&#x20;   "Typography instantly signals quality. Avoid using boring, generic fonts.\\n",

&#x20;   "\\n",

&#x20;   "\*\*Never use:\*\* Inter, Roboto, Open Sans, Lato, default system fonts\\n",

&#x20;   "\\n",

&#x20;   "\*\*Impact choices:\*\*\\n",

&#x20;   "- Code aesthetic: JetBrains Mono, Fira Code, Space Grotesk\\n",

&#x20;   "- Editorial: Playfair Display, Crimson Pro, Fraunces\\n",

&#x20;   "- Startup: Clash Display, Satoshi, Cabinet Grotesk\\n",

&#x20;   "- Technical: IBM Plex family, Source Sans 3\\n",

&#x20;   "- Distinctive: Bricolage Grotesque, Obviously, Newsreader\\n",

&#x20;   "\\n",

&#x20;   "\*\*Pairing principle:\*\* High contrast = interesting. Display + monospace, serif + geometric sans, variable font across weights.\\n",

&#x20;   "\\n",

&#x20;   "\*\*Use extremes:\*\* 100/200 weight vs 800/900, not 400 vs 600. Size jumps of 3x+, not 1.5x.\\n",

&#x20;   "\\n",

&#x20;   "Pick one distinctive font, use it decisively. Load from Google Fonts. State your choice before coding.\\n",

&#x20;   "</use\_interesting\_fonts>\\n",

&#x20;   "\\"\\"\\"\\n",

&#x20;   "\\n",

&#x20;   "# Generate with typography-only guidance\\n",

&#x20;   "generate\_html\_with\_claude(BASE\_SYSTEM\_PROMPT + \\"\\\\n\\\\n\\" + TYPOGRAPHY\_PROMPT, USER\_PROMPT)"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "### Example 2: Theme Constraint\\n",

&#x20;   "\\n",

&#x20;   "Lock in a specific aesthetic when you want consistent theming across generations:"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "code",

&#x20;  "execution\_count": null,

&#x20;  "metadata": {},

&#x20;  "outputs": \[],

&#x20;  "source": \[

&#x20;   "SOLARPUNK\_THEME\_PROMPT = \\"\\"\\"\\n",

&#x20;   "<always\_use\_solarpunk\_theme>\\n",

&#x20;   "Always design with Solarpunk aesthetic:\\n",

&#x20;   "- Warm, optimistic color palettes (greens, golds, earth tones)\\n",

&#x20;   "- Organic shapes mixed with technical elements\\n",

&#x20;   "- Nature-inspired patterns and textures\\n",

&#x20;   "- Bright, hopeful atmosphere\\n",

&#x20;   "- Retro-futuristic typography\\n",

&#x20;   "</always\_use\_solarpunk\_theme>\\n",

&#x20;   "\\"\\"\\"\\n",

&#x20;   "\\n",

&#x20;   "# Generate with theme constraint\\n",

&#x20;   "generate\_html\_with\_claude(\\n",

&#x20;   "    BASE\_SYSTEM\_PROMPT + \\"\\\\n\\\\n\\" + SOLARPUNK\_THEME\_PROMPT,\\n",

&#x20;   "    \\"Create a dashboard for renewable energy monitoring\\",\\n",

&#x20;   ")"

&#x20;  ]

&#x20; },

&#x20; {

&#x20;  "cell\_type": "markdown",

&#x20;  "metadata": {},

&#x20;  "source": \[

&#x20;   "## Summary\\n",

&#x20;   "\\n",

&#x20;   "Claude has strong design capabilities but defaults to safe, generic choices. The techniques in this guide - targeting specific design dimensions, referencing concrete inspirations, and explicitly avoiding common defaults - reliably produce more distinctive output. The full aesthetics prompt works well as a baseline. For more control, use isolated prompts to focus on individual aspects or lock in specific themes across multiple generations."

&#x20;  ]

&#x20; }

&#x20;],

&#x20;"metadata": {

&#x20; "kernelspec": {

&#x20;  "display\_name": "py311",

&#x20;  "language": "python",

&#x20;  "name": "python3"

&#x20; },

&#x20; "language\_info": {

&#x20;  "codemirror\_mode": {

&#x20;   "name": "ipython",

&#x20;   "version": 3

&#x20;  },

&#x20;  "file\_extension": ".py",

&#x20;  "mimetype": "text/x-python",

&#x20;  "name": "python",

&#x20;  "nbconvert\_exporter": "python",

&#x20;  "pygments\_lexer": "ipython3",

&#x20;  "version": "3.11.13"

&#x20; }

&#x20;},

&#x20;"nbformat": 4,

&#x20;"nbformat\_minor": 4

}

</frontend\_aesthetics>

