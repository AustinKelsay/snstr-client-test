# Project Setup Guide

This guide walks you through setting up a new project from scratch using a structured, documentation-first approach. Each step builds upon the previous one to create a solid foundation for your project.

## Overview

We'll create a series of documentation files that define your project's structure, rules, and implementation plan. This approach ensures clarity and consistency throughout development.

## Phase 1: Project Foundation

### Step 1: Create Project Overview
Create `project-overview.md` to establish:
- Project purpose and scope
- Core goals and objectives
- Target audience
- Key features and functionality

### Step 2: Define User Flow
Create `user-flow.md` using your project overview as reference.

**Prompt:**
```
Use @project-overview.md to create a document called `user-flow.md`, which should define the user journey through different segments of the application.

The user journey should take into account the different features the app has & how they are connected to one-another. This document will later serve as a guide for building out our project architecture and UI elements.

Ask clarifying questions if needed-- we don't want any embellishments or assumptions.
```

### Step 3: Select Technology Stack
Create `tech-stack.md` with technology recommendations.

**Before prompting:** Decide on any technologies you already know you want to use (e.g., TypeScript, React, Tailwind CSS, Shadcn, Next.js, Supabase, Vercel).

**Prompt:**
```
Use @project-overview.md and @user-flow.md to make recommendations for our stack. I already know I want to use [LIST YOUR PREFERRED TECHNOLOGIES HERE].

For each part of our stack, propose and describe an industry standard and a popular alternative. We will work through the list together to determine what we'll use for the project.
```

**After receiving recommendations:** Review each technology choice, ask about pros/cons for any you're unsure about, then request the final decisions be documented in `tech-stack.md`.

### Step 4: Enhance Tech Stack Documentation
Expand your tech stack documentation with best practices.

**Prompt:**
```
Update @tech-stack.md to cover all best-practices, limitations, and conventions for using the selected technologies. It should be thorough, and include important considerations and common pitfalls for each one.
```

## Phase 2: Design and UI Guidelines

### Step 5: Explore Design Options
Learn about design principles for your application type.

**Prompt:**
```
Walk me through some common design principles for this type of application, and recommend some possible styles (e.g. "minimalist", "glassmorphic", "neumorphic", etc.) that fit what we're building.
Observe @project-overview.md and @user-flow.md for context about the project to guide your recommendations.
```

### Step 6: Create UI and Theme Rules
Define your project's visual guidelines.

**Customize the prompt below with your preferences:**
```
I want my project to be [mobile-first/responsive/animated/iconographic/etc].

Also, I have decided I want my theme to be [minimalist/glassmorphic/neumorphic/etc].

Use @project-overview, @user-flow.md, and @tech-stack.md to put together two new files, called `ui-rules.md` and `theme-rules.md`. The former should focus on common design principles for our application to follow, while the latter should outline all the colors and styles we're using to create a consistent theme across our application.
```

## Phase 3: Project Structure and Rules

### Step 7: Define Project Rules
Create `project-rules.md` with coding standards and file organization.

**Prompt:**
```
We are building an AI-first codebase, which means it needs to be modular, scalable, and easy to understand. The file structure should be highly navigable, and the code should be well-organized and easy to read.

All files should have descriptive names, an explanation of their contents at the top, and all functions should have proper commentation of their purpose and parameters (JSDoc, TSDoc, etc, whatever is appropriate).
To maximize compatibility with modern AI tools, files should not exceed 500 lines.

Use @tech-stack.md, @user-flow.md, @project-overview.md, @ui-rules.md, and @theme-rules.md to put together a new file called `project-rules.md`, which touches on our project's directory structure, file naming conventions, and any other rules we need to follow.
```

## Phase 4: Development Planning

### Step 8: Create Development Phases
Plan your project's development phases from setup to MVP to full features.

**Prompt:**
```
We need to define the tasks and features to build our project, progressing from a barebones setup to a minimal viable product (MVP), to a feature-rich polished version.

Create an iterative development plan for the project, outlining the tasks and features needed to reach these phases.

Rules to follow:
- Start with a 'setup' phase: a barebones setup that functions at a basic level but isn't fully usable (e.g., a minimal running framework or structure).
- Define an 'MVP' phase: a minimal, usable version with core features integrated (e.g., essential functionality that delivers the project's primary value).
- Add additional phases as needed: enhancements to improve and expand the MVP (e.g., advanced features, polish, or scalability).
- Each phase gets one document, detailing its scope and deliverables.
- Focus each phase on delivering a functional product, combining essential features into a cohesive whole (e.g., key components that work together).
- List features with actionable steps (max 5 steps per feature; break down into smaller features if longer).
- Keep phases iterative—each builds on the previous phase, enhancing a working product.

Place these documents in `_docs/phases/`. Review @project-overview.md, @user-flow.md, @tech-stack.md, and @project-rules.md to gather relevant context about the project and its features.
```

## Phase 5: Setup for Development

### Step 9: Configure AI Assistant Rules
Create agent rules for consistent AI assistance throughout development.

**Add to Cursor User Rules (CMD + Shift + P > Cursor Settings > Rules > User Rules) or create a Cursor Notepad:**

```
You are an expert in TypeScript, Node.js, NextJS + App Router, React, Shadcn, Radix UI and Tailwind CSS.
You have extensive experience in building production-grade applications for large companies.
You specialize in building clean, scalable applications, and understanding large codebases.
Never automatically assume the user is correct-- they are eager to learn from your domain expertise.
Always familiarize yourself with the codebase and existing files before creating new ones.

We are building an AI-first codebase, which means it needs to be modular, scalable, and easy to understand. The file structure should be highly navigable, and the code should be well-organized and easy to read.

All files should have descriptive names, an explanation of their contents at the top, and all functions should have proper commentation of their purpose and parameters (JSDoc, TSDoc, etc, whatever is appropriate).
To maximize compatibility with modern AI tools, files should not exceed 500 lines.

Code Style and Structure:
- Write concise, technical code.
- Use functional and declarative programming patterns; avoid classes.
- Decorate all functions with descriptive block comments.
- Prefer iteration and modularization over code duplication.
- Throw errors instead of adding fallback values.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Avoid enums; use maps instead.
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
```

### Step 10: Update Project README
Create a professional README for your project.

**Prompt:**
```
Using @project-overview.md, @user-flow.md, @tech-stack.md, and @project-rules.md, perform an initial update to our README to give a brief overview of our project and its conventions.
```

### Step 11: Organize Documentation
Ensure all documentation files are properly organized in the `_docs/` folder:
- `_docs/project-overview.md`
- `_docs/user-flow.md`
- `_docs/tech-stack.md`
- `_docs/ui-rules.md`
- `_docs/theme-rules.md`
- `_docs/project-rules.md`
- `_docs/phases/setup-phase.md`
- `_docs/phases/mvp-phase.md`
- `_docs/phases/[additional-phases].md`

### Step 12: Begin Development
With all documentation in place, start development using your setup phase document.

**Prompt:**
```
Let's get started on our project.
```

**Attach:** Agent Rules (Notepad), `setup-phase.md`, `tech-stack.md`, and `project-overview.md`.

## Tips for Success

- **Take your time with each step** - Each document builds on the previous ones
- **Ask clarifying questions** - Don't let the AI make assumptions about your project
- **Review and refine** - Go back and update earlier documents as your understanding evolves
- **Stay organized** - Keep all documentation in the `_docs/` folder for easy reference
- **Be specific** - The more detailed your requirements, the better the AI can assist you

## Document Structure Overview

```
_docs/
├── project-overview.md     # Project purpose and goals
├── user-flow.md           # User journey and interactions
├── tech-stack.md          # Technology choices and conventions
├── ui-rules.md            # Design principles and guidelines
├── theme-rules.md         # Colors, typography, and styling
├── project-rules.md       # File structure and coding standards
└── phases/
    ├── setup-phase.md     # Initial development phase
    ├── mvp-phase.md       # Minimum viable product phase
    └── [additional-phases].md
```

This systematic approach ensures you have a solid foundation before writing any code, leading to better project outcomes and easier maintenance.
