function isBlockedImage(url) {
    if(url.includes('pbs.twimg.com')){
        return true
    } else if (url.includes('cryptopotato.com')){
        return true
    } else {
        return false
    }
}

function extractImage(item) {
    if (item.thumbnail && item.thumbnail.trim() !== "" && !isBlockedImage(item.thumbnail)) {
        return item.thumbnail;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.content;
    const img = tempDiv.querySelector('img');
    return (img && img.src && !isBlockedImage(img.src)) 
        ? img.src 
        : 'https://via.placeholder.com/80x60?text=No+Image';
}

function getSourceFromLink(link) {
    try {
        const url = new URL(link);
        return url.hostname.replace('www.', '');
    } catch {
        return 'unknown source';
    }
}

async function fetchFeed(url) {
    const noCacheUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&t=${Date.now()}`;
    const res = await fetch(noCacheUrl, {
        cache: 'no-store' // explicitly tells browser not to cache
    });
    const data = await res.json();
    return data.items.map(item => {
        let timeStr = item.pubDate;
        if (!timeStr.endsWith("Z")) timeStr += "Z";
        const localDate = new Date(timeStr);
        return {
            title: item.title,
            link: item.link,
            content: item.content,
            pubDate: localDate,
            image: extractImage(item),
            source: getSourceFromLink(item.link)
        };
    });
}

(async () => {
    const bitcoinFeed = await fetchFeed("https://news.bitcoin.com/feed/");
    const newsbtcFeed = await fetchFeed("https://www.newsbtc.com/feed/");
    const cointelegraphFeed = await fetchFeed("https://cointelegraph.com/rss");
    const cryptoPotatoFeed = await fetchFeed("https://cryptopotato.com/feed/");
    const todayqNewsFeed = await fetchFeed("https://news.todayq.com/feed/");
    const cryptonewsFeed = await fetchFeed("https://cryptonews.com/feed/");



    const combined = [...bitcoinFeed, ...newsbtcFeed, ...cointelegraphFeed, ...cryptoPotatoFeed, ...todayqNewsFeed, ...cryptonewsFeed];
    //const combined = [...bitcoinFeed];
    combined.sort((a, b) => b.pubDate - a.pubDate);
    window.newsData = combined;

    const container = document.getElementById('news-feed');
    const loadMoreBtn = document.getElementById('load-more');
    let currentIndex = 0;
    const step = 10;

    function renderArticles() {
        const slice = combined.slice(currentIndex, currentIndex + step);
        slice.forEach((item, index) => {
            const formatted = item.pubDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const article = document.createElement('div');
            article.style = "font-size:12px; text-align: left; margin-bottom: 20px";

            article.innerHTML = `
            <div class="row">
                <div class="col-3">
                    <img src="${item.image}" alt="thumbnail" style="width: 80px; height: 60px; object-fit: cover; margin-right: 20px; border-radius: 5px;">
                </div>
                <div class="col-9">
                    <h5 style="margin: 0 0 5px 0; font-size:14px;">
                        <a style="color: #ffffff; text-decoration: none;" onclick="showModal(${currentIndex + index})">${item.title}</a>
                    </h5>
                    <p style="color: #ccc; font-size: 10px; margin: 0;">${formatted} <span style="color: #999"><i>Source: ${item.source}</i></span></p>
                </div>
            </div>
            <hr style="border: none; height: 2px; background-color: #f7931a; margin: 20px 0;">
            `;
            container.appendChild(article);
        });
        currentIndex += step;
        if (currentIndex >= combined.length) {
            loadMoreBtn.style.display = "none";
        }
    }

    renderArticles();

    // show button
    document.getElementById('news-spinner').style.display = "none";
    document.getElementById('load-more').style.display = "block";

    loadMoreBtn.addEventListener('click', renderArticles);
})();