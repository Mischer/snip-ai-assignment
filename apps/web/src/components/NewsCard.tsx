type Props = {
  title: string;
  subtitle?: string;
  url: string;
  source?: string;
  category?: string;
  publishedAt: string;
};

export default function NewsCard({
                                   title,
                                   subtitle,
                                   url,
                                   source,
                                   category,
                                   publishedAt,
                                 }: Props) {
  const host = source || new URL(url).hostname.replace(/^www\./, "");
  const date = new Date(publishedAt).toLocaleString();

  return (
    <a className="news" href={url} target="_blank" rel="noreferrer">
      <div className="news-header">
        {category && <span className="badge badge-gray">{category}</span>}
        <span className="news-source">{host}</span>
      </div>

      <div className="news-title">{title}</div>
      {subtitle && <div className="news-fake">{subtitle}</div>}
      <div className="news-real">{date}</div>
    </a>
  );
}