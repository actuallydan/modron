# Modron

Content Moderation API with OpenAI

Mostly for my own personal use, this lightly abstracts over OpenAI's moderation ML endpoint.

You can try it yourself at [modron.vercel.app](https://modron.vercel.app)

or make a POST request

```
curl -X POST -H "Content-Type: application/json" -d '{"input":"hello"}' https://modron.vercel.app/api/moderation
```
