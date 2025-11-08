import React, { useState } from 'react';

const BotCustomization: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleStartCrawl = async () => {
    if (!url.trim()) {
      setMessage('Please enter a valid URL.');
      return;
    }

    setIsCrawling(true);
    setMessage('Initiating crawl...');

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start crawl.');
      }

      const data = await response.json();
      setMessage(`Crawl initiated successfully: ${data.status || 'Processing...'}`);
    } catch (error: any) {
      console.error('Crawl initiation error:', error);
      setMessage(`Error: ${error.message || 'Could not initiate crawl.'}`);
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Bot Customization - Web Crawler</h2>
      <div className="mb-4">
        <label htmlFor="crawl-url" className="block text-gray-700 text-sm font-bold mb-2">
          URL to Crawl:
        </label>
        <input
          id="crawl-url"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="e.g., https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isCrawling}
        />
      </div>
      <button
        onClick={handleStartCrawl}
        disabled={isCrawling}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isCrawling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isCrawling ? 'Crawling...' : 'Start Crawl'}
      </button>
      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default BotCustomization;
