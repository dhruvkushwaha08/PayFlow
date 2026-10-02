import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { askAiAssistant } from '../services/api'

function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAsk() {
    if (!question.trim()) {
      return
    }

    setLoading(true)
    setAnswer('')
    setError('')

    try {
      const response = await askAiAssistant(question.trim())

      setAnswer(response.answer || response.message || '')
    } catch (err) {
      console.error(err)
      setError('Unable to get a response from the AI Assistant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>
            Ask questions about PayFlow policies and payroll rules.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="ai-question">
            Your Question
          </label>

          <textarea
            id="ai-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about PayFlow policies..."
            rows="5"
            disabled={loading}
          />
        </div>

        <button
          type="button"
          className="ai-ask-button"
          onClick={handleAsk}
          disabled={loading || !question.trim()}
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {answer && (
          <div className="ai-answer">
            <div className="ai-answer-header">
              <div>
                <span className="ai-answer-label">
                  PAYFLOW AI
                </span>

                <h3>AI Assistant</h3>
              </div>
            </div>

            <div className="ai-answer-content">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAssistant