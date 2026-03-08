"use client"

import { useState } from "react"

type FAQItem = {
  question: string
  answer: string
}

type FAQCategory = {
  title: string
  items: FAQItem[]
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const categories: FAQCategory[] = [
    {
      title: "Predictions",
      items: [
        {
          question: "How are Projection Targets calculated?",
          answer:
            "Projection Targets use de-vigged implied probabilities averaged across sportsbooks with a 5% edge threshold."
        }
      ]
    },
    {
      title: "Lineups",
      items: [
        {
          question: "How is value calculated?",
          answer:
            "Value equals (Projected Fantasy Points / Daily Fantasy Sports (DFS) Cost) × 1000."
        }
      ]
    },
    {
      title: "On This Day (OTD)",
      items: [
        {
          question: "How is OTD Value calculated?",
          answer:
            "OTD Value equals REAL Rating × Position Boost × Card Level Multiplier."
        }
      ]
    }
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()

  const form = e.currentTarget  // ✅ store reference immediately
  setStatus("Sending...")

  const formData = new FormData(form)

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    })
  })

  if (response.ok) {
    setStatus("Message sent successfully!")
    form.reset() // ✅ safe now
  } else {
    setStatus("Something went wrong.")
  }
}


  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Frequently Asked Questions</h1>

        {categories.map((category, catIndex) => (
          <div key={catIndex} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{category.title}</h2>

            {category.items.map((item, index) => {
              const key = `${catIndex}-${index}`
              const isOpen = openIndex === key

              return (
                <div key={key} style={styles.card}>
                  <div
                    style={styles.question}
                    onClick={() =>
                      setOpenIndex(isOpen ? null : key)
                    }
                  >
                    {item.question}
                    <span>{isOpen ? "−" : "+"}</span>
                  </div>

                  <div
                    style={{
                      ...styles.answerWrapper,
                      maxHeight: isOpen ? "400px" : "0px"
                    }}
                  >
                    <div style={styles.answer}>
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Contact Section */}
        <div style={styles.contactSection}>
          <h2 style={styles.contactTitle}>Still have questions?</h2>
          <p style={styles.contactText}>
            Send us a message and we’ll get back to you.
          </p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Your Name"
              required
              style={styles.input}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              required
              style={styles.input}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              required
              style={styles.textarea}
            />
            <button type="submit" style={styles.contactButton}>
              Send Message
            </button>
          </form>

          {status && (
            <p style={styles.status}>{status}</p>
          )}
        </div>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "black",
    color: "#E5E4BA",
    padding: "60px 0"
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 40px"
  },
  title: {
    fontSize: "32px",
    marginBottom: "40px"
  },
  categorySection: {
    marginBottom: "30px"
  },
  categoryTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "##94a3b8"
  },
  card: {
    backgroundColor: "#525252",
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid gray",
    overflow: "hidden"
  },
  question: {
    padding: "15px 20px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 600
  },
  answerWrapper: {
    overflow: "hidden",
    transition: "all 0.3s ease"
  },
  answer: {
    padding: "0 20px 20px 20px",
    color: "#cbd5e1"
  },
  contactSection: {
    marginTop: "50px",
    padding: "30px",
    backgroundColor: "#171717",
    borderRadius: "14px",
    border: "1px solid #404040"
  },
  contactTitle: {
    fontSize: "20px",
    marginBottom: "10px"
  },
  contactText: {
    marginBottom: "20px",
    color: "#94a3b8"
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px"
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#262626",
    color: "white"
  },
  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#262626",
    color: "white",
    minHeight: "100px"
  },
  contactButton: {
    backgroundColor: "#E5E4BA",
    color: "black",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600
  },
  status: {
    marginTop: "15px",
    color: "#22c55e"
  }
}
