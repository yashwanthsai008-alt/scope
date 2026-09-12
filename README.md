# SCOPE Club Website

**Learn. Build. Innovate.**

A complete, responsive website for SCOPE Club — a student-driven technical community focused on coding, cloud technologies, hackathons, projects, and technical events.

---

## Project Files

| File         | Description                                      |
|--------------|--------------------------------------------------|
| `index.html` | Main HTML file with all website sections         |
| `style.css`  | All styles, themes, animations, and responsive layout |
| `script.js`  | JavaScript for interactivity and functionality   |
| `README.md`  | This file — setup and deployment instructions    |

---

## Features

- Dark / Light mode toggle (saves preference in browser)
- Fully responsive (mobile, tablet, desktop)
- Sticky navigation with active link highlighting
- Smooth scrolling between sections
- Hamburger menu on mobile
- Scroll reveal animations
- Contact form with success message
- Floating scroll-to-top button
- Pure HTML, CSS and vanilla JavaScript — no frameworks

---

## Running Locally

No build tools or server needed. Simply open `index.html` in your browser:

1. Download or clone all three files into the same folder.
2. Double-click `index.html` — it opens directly in your browser.
3. All features work locally without a web server.

> **Note:** Google Fonts requires an internet connection to load. The site falls back to system fonts if offline.

---

## Deploying to AWS S3 Static Website Hosting

AWS S3 (Simple Storage Service) can host static websites for very low cost. Follow these steps carefully.

---

### Step 1 — Create an AWS Account

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Click **Create an AWS Account**.
3. Fill in your email address, account name and password.
4. Enter your payment details (required by AWS, but the free tier is available).
5. Complete phone verification.
6. Choose the **Free tier** support plan.
7. Once your account is active, sign in to the **AWS Management Console** at [https://console.aws.amazon.com/](https://console.aws.amazon.com/)

---

### Step 2 — Create an S3 Bucket

An S3 bucket is a storage container where your website files will live.

1. In the AWS Console, search for **S3** in the top search bar and click it.
2. Click **Create bucket**.
3. Under **Bucket name**, enter a unique name.
   - Bucket names must be globally unique across all AWS accounts.
   - Use something like `scopeclub-website` or `scopeclub-2026`.
   - Bucket names can only contain lowercase letters, numbers and hyphens.
4. Under **AWS Region**, select the region closest to your audience (e.g., `ap-south-1` for India).
5. Under **Block Public Access settings for this bucket**:
   - **Uncheck** the checkbox that says **Block all public access**.
   - A warning will appear — acknowledge it by checking the confirmation box.
   - ⚠️ **Important:** Only do this for a website bucket you intend to make public. Never do this for buckets containing sensitive data.
6. Leave all other settings at their defaults.
7. Click **Create bucket**.

---

### Step 3 — Upload Your Website Files

1. Click on the bucket you just created to open it.
2. Click **Upload**.
3. Click **Add files** and select all three files:
   - `index.html`
   - `style.css`
   - `script.js`
4. Click **Upload** to start the transfer.
5. Wait until all files show **Succeeded** status.
6. Click **Close**.

---

### Step 4 — Enable Static Website Hosting

1. Inside your bucket, click the **Properties** tab.
2. Scroll down to the **Static website hosting** section.
3. Click **Edit**.
4. Select **Enable**.
5. Under **Hosting type**, choose **Host a static website**.
6. In the **Index document** field, type:
   ```
   index.html
   ```
7. Optionally, in the **Error document** field, type:
   ```
   index.html
   ```
   (This sends users back to your homepage if they visit a missing URL.)
8. Click **Save changes**.
9. Scroll back down to **Static website hosting** — you will now see a **Bucket website endpoint** URL. Copy it — this is your website address.

---

### Step 5 — Make the Bucket Publicly Accessible

Your files are uploaded but still private. You need to add a **bucket policy** to make them public.

1. Inside your bucket, click the **Permissions** tab.
2. Scroll down to **Bucket policy** and click **Edit**.
3. Paste the following policy into the editor. **Replace `YOUR-BUCKET-NAME` with your actual bucket name:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **Save changes**.

> ✅ Your bucket now allows anyone on the internet to read (but not write) your files.

---

### Step 6 — Access Your Live Website

1. Go back to the **Properties** tab.
2. Scroll down to **Static website hosting**.
3. Click the **Bucket website endpoint** link.

Your SCOPE Club website is now live! 🎉

The URL will look like:
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

---

## Updating the Website

To update your website after making changes:

1. Edit the files locally.
2. Go to your S3 bucket in the AWS Console.
3. Upload the updated files — S3 will overwrite the old versions.
4. Refresh your website URL in the browser.

> **Tip:** If changes don't appear immediately, try a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac).

---

## Custom Domain (Optional)

If you want to use a custom domain like `scopeclub.college.edu`:

1. Register a domain through **AWS Route 53** or another domain registrar.
2. Use **Amazon CloudFront** as a CDN in front of your S3 bucket.
3. Request a free SSL certificate via **AWS Certificate Manager**.
4. Point your domain's DNS records to CloudFront.

This is an advanced step and is not required for basic hosting.

---

## ⚠️ Important: AWS Permissions & Security

- **Only make a bucket public when it is specifically intended for website hosting.**
- Never store passwords, API keys, database credentials, or personal data in a public S3 bucket.
- If you create additional S3 buckets for other purposes (data storage, backups, etc.), keep them private.
- Regularly review your S3 bucket permissions in the AWS Console.
- Consider enabling **AWS CloudTrail** to log access to your buckets.
- The free tier includes 5 GB of S3 storage and 20,000 GET requests per month — more than enough for a small club website.

---

## Customising the Website

### Replacing Placeholder Links

Search the `index.html` file for comments marked `<!-- TODO: -->`. These mark the social media and email links that need to be updated:

| Placeholder                     | Replace With                        |
|---------------------------------|-------------------------------------|
| `https://instagram.com/`        | Your club's Instagram URL           |
| `https://linkedin.com/`         | Your club's LinkedIn page URL       |
| `scopeclub@example.com`         | Your club's actual email address    |

### Adding Real Resources

In the **Learning Resources** section, find the `href="#"` attributes on each **Explore** button and replace `#` with the actual resource URL.

### Changing Colors

All colors are defined as CSS variables at the top of `style.css` inside the `[data-theme="dark"]` and `[data-theme="light"]` blocks. Edit them there to change the color scheme site-wide.

---

## Technology Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** — No frameworks or libraries
- **Google Fonts** — Inter font family
- **AWS S3** — Static website hosting

---

## Built With ❤️ by SCOPE Club

*Part of the SCOPE Club Web Development Workshop — HTML, CSS & AWS Fundamentals*
