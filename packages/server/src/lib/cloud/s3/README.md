# S3 Configuration for File Uploads

This guide explains how to configure AWS S3 buckets for the application.

We generally use two types of buckets:

1. **Public Bucket**: For public assets like user avatars, blog post images, etc.
2. **Private Bucket**: For sensitive user files like invoices, contracts, etc.

---

## 1. Public Bucket Setup (e.g., Avatars)

This bucket allows anyone on the internet to **view** (GET) files directly via URL, but only authorized users (via our app) can **upload** (PUT) or **delete** them.

### A. Bucket Permissions (Public Read)

1. Go to your Bucket > **Permissions**.
2. **Block public access (bucket settings)**: Uncheck "Block all public access" and Save.
3. **Bucket Policy**: Paste the following to allow public read access. Replace `YOUR_PUBLIC_BUCKET_NAME` with your actual bucket name.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_PUBLIC_BUCKET_NAME/*"
        }
    ]
}
```

### B. CORS Configuration

Required for client-side uploads (presigned URLs) and client-side rendering.

1. Go to **Permissions** > **Cross-origin resource sharing (CORS)**.
2. Paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

Note: In production, replace `AllowedOrigins: ["_"]`with your actual domain, e.g.,`["https://myapp.com"]`.\*

---

## 2. Private Bucket Setup (e.g., Sensitive Files)

This bucket blocks all public access. Files can only be accessed via the application (server-side proxy or presigned GET URLs).

### A. Bucket Permissions (Private)

1. Go to your Bucket > **Permissions**.
2. **Block public access (bucket settings)**: **Check** "Block all public access" (This is the default and recommended).
3. **Bucket Policy**: Leave empty (default).

### B. CORS Configuration (Private)

Still required for the client to Upload (PUT) directly to S3 using a presigned URL.

1. Go to **Permissions** > **Cross-origin resource sharing (CORS)**.
2. Paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

---

## 3. IAM User Configuration

The application needs an IAM user with permissions to manage files in these buckets.

1. Go to **IAM** > **Users** > **Create user**.
2. Name it (e.g., `app-s3-upload-user`).
3. **Permissions options**: Attach policies directly.
4. Create a **JSON Policy** using the config below.

**Important**: This single user can manage BOTH buckets if you list them both in the Resource section.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ManageBucketObjects",
            "Effect": "Allow",
            "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
            "Resource": [
                "arn:aws:s3:::YOUR_PUBLIC_BUCKET_NAME/*",
                "arn:aws:s3:::YOUR_PRIVATE_BUCKET_NAME/*"
            ]
        }
    ]
}
```

Note: `s3:GetObject` is strictly required for the **Private** bucket if the server needs to read/proxy files. It's optional for the Public bucket (since it's already public).\_

---

## 4. Environment Variables

Copy the credentials to your `.env` file.

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Bucket Names
AWS_PUBLIC_BUCKET_NAME=my-app-public-assets
AWS_PRIVATE_BUCKET_NAME=my-app-private-files
```
