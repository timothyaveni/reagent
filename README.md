# reagent

reagent is an open-source Web platform designed to facilitate rapid prototyping of AI-backed software for developers.
The platform offers a prompt authoring interface for generative AI models, creating a **hosted API** for each prompt that can be used immediately in software prototypes, with instrumentation that allows for quick debugging and refinement.

## Why?

AI can help us **augment traditional UIs**, rather than just turning everything into a chat text field:

<p align="center">
  <img src=".readme-images/todo-ai.gif" alt="Video demo of a 'todo list' app, where items are automatically categorized correctly">
</p>

<p align="center">
  <img src=".readme-images/todo-in-use.png" alt="Diagram showing a configured prompt and runtime variable, resulting in AI output for use in the software prototype">
</p>

We designed reagent to facilitate the process of integrating AI models into a wide range of software prototypes. See this walkthrough video for our [programming assignment](https://docs.google.com/document/d/1icRnM4s_1evEevnNxXBkORqz7et-GxB-e9VXt5pOEyU/edit) designed to introduce students to reagent and the use of AI models in software prototyping:

<p align="center">
  <a href="https://www.youtube.com/watch?v=zW6F4dyj4eg"><img src="https://img.youtube.com/vi/zW6F4dyj4eg/0.jpg" alt="reagent programming assignment walkthrough"></a>
</p>

## 1. Create a "noggin" to perform a particular task

<p align="center">
  <img src=".readme-images/noggin-authoring.png" alt="Screenshot of the noggin authoring interface">
</p>

Use the noggin authoring interface to design a prompt template for a generative AI model.
Specify variables that will be used at runtime to construct the full prompt.

## 2. "Use your noggin" in your software prototype

<p align="center">
  <img src=".readme-images/noggin-use.png" alt="The 'use' page, allowing for experimentation in reagent and offering a code sample">
</p>

Experiment within reagent, and once you're satisfied, use the automatically-created hosted API in your own software prototypes.
Any variables you created in your prompt will be input variables in the API.

## 3. Visualize past runs

<p align="center">
  <img src=".readme-images/noggin-use-instance.png" alt="A visualization of a 'chat' instance where the noggin was used">
</p>

Visualize all API calls, even those made from your prototype code, to see the exact input and output in the AI call.

## Features

### Rich prompt-editing sandbox

<p align="center">
  <img src=".readme-images/reagent-editor.gif" alt="The prompt editor supports chat turns, variables, and live collaboration.">
</p>

reagent's prompt editor is designed from the beginning for generative AI and offers first-class support for live collaboration. Each model uses a declarative configuration file to customize exactly which fields are present in the editor and how they behave.

<p align="center">
  <img src=".readme-images/output-structure.png" alt="Graphical JSON schema editor for model output structure">
</p>

reagent includes an "output structure" editor, allowing you to configure the format of the AI output, for supported models.

### Multimodal input and TTI support

<p align="center">
  <img src=".readme-images/tti-dragon.webp" alt="A screenshot of a text-to-image prompt and its output">
</p>

reagent and its prompt sandbox are designed from the ground up to support inputs and outputs of various formats, meaning it's easy to prototype with the latest AI models.

reagent is provider-agnostic, provided the right adapters are implemented in `noggin-server`. Currently supported are [OpenAI](https://openai.com/) models, [Anthropic](https://www.anthropic.com/) models, and open-source models like Llama provided by [Replicate](https://replicate.com/).

### Automatic streaming output

<p align="center">
  <img src=".readme-images/reagent-streaming.gif" alt="Video showing a raw reagent API call, with its output streamed">
</p>

Hosted APIs can automatically stream their output, where supported by the backing AI model.

### Budgeting and per-request cost tracking

<p align="center">
  <img src=".readme-images/budget-1.png" alt="Noggins can have their budgets configured individually.">
</p>

When providers support cost calculation, reagent keeps track of how much each request costs and can cut off access before racking up a big bill.

<p align="center">
  <img src=".readme-images/budget-2.png" alt="Each request has its consumed shown.">
</p>

### Tools for instructors and team managers

Instructors can create an organization and team up students, setting individual or shared budgets to fund their students' innovation. Teaching assistants can poke in to observe students' prompt engineering and help them debug.
Students never need to configure API keys or billing, and LTI support means students can log in through their LMS and be automatically enrolled into an organization.

## How to build

(these instructions are super bare at the moment; reach out to tja@berkeley.edu if you're trying to set up a development environment)

- copy .env.example to .env and create a secret
- `cd gen-websocket-keys && ./gen.sh`
- `docker compose up`
- `dev-utils/prisma-remix.sh db push`
- `dev-utils/prisma-remix.sh db seed`
- you may need to play around to get minio to work; there's a script in `minio/init-buckets.sh` that you can run in the Docker container to configure the object storage buckets.
