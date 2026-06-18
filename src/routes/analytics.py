from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy import func, case, text
from models.db_schemes import QueryLog
from datetime import datetime, timedelta

analytics_router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["api_v1", "analytics"],
)


@analytics_router.get("/overview")
async def get_analytics(request: Request):
    project = request.state.project
    now = datetime.utcnow()

    async with request.app.db_client() as session:

        # Request counts by period
        def count_since(dt):
            return select(func.count(QueryLog.log_id)).where(
                QueryLog.project_id == project.project_id,
                QueryLog.created_at >= dt
            )

        day_count   = (await session.execute(count_since(now - timedelta(days=1)))).scalar()
        week_count  = (await session.execute(count_since(now - timedelta(weeks=1)))).scalar()
        month_count = (await session.execute(count_since(now - timedelta(days=30)))).scalar()
        year_count  = (await session.execute(count_since(now - timedelta(days=365)))).scalar()

        # Answered vs unanswered totals
        totals = await session.execute(
            select(
                func.count(QueryLog.log_id).label("total"),
                func.sum(case((QueryLog.was_answered == True, 1), else_=0)).label("answered"),
                func.sum(case((QueryLog.was_answered == False, 1), else_=0)).label("unanswered"),
            ).where(QueryLog.project_id == project.project_id)
        )
        totals = totals.fetchone()

        # Average response time (answered only)
        avg_time = await session.execute(
            select(func.avg(QueryLog.response_time_ms)).where(
                QueryLog.project_id == project.project_id,
                QueryLog.was_answered == True,
                QueryLog.response_time_ms.isnot(None)
            )
        )
        avg_response_ms = avg_time.scalar() or 0

        # Top 10 most asked answered questions
        top_answered = await session.execute(
            select(QueryLog.query_text, func.count(QueryLog.log_id).label("count"))
            .where(
                QueryLog.project_id == project.project_id,
                QueryLog.was_answered == True
            )
            .group_by(QueryLog.query_text)
            .order_by(func.count(QueryLog.log_id).desc())
            .limit(10)
        )

        # Top 10 most asked unanswered questions
        top_unanswered = await session.execute(
            select(QueryLog.query_text, func.count(QueryLog.log_id).label("count"))
            .where(
                QueryLog.project_id == project.project_id,
                QueryLog.was_answered == False
            )
            .group_by(QueryLog.query_text)
            .order_by(func.count(QueryLog.log_id).desc())
            .limit(10)
        )

        # Requests per day for last 30 days (for chart)
        daily_counts = await session.execute(
            select(
                func.date_trunc('day', QueryLog.created_at).label("day"),
                func.count(QueryLog.log_id).label("count")
            )
            .where(
                QueryLog.project_id == project.project_id,
                QueryLog.created_at >= now - timedelta(days=30)
            )
            .group_by(text("day"))
            .order_by(text("day"))
        )

        # Locations
        locations = await session.execute(
            select(
                QueryLog.country,
                QueryLog.city,
                QueryLog.latitude,
                QueryLog.longitude,
                func.count(QueryLog.log_id).label("count")
            )
            .where(
                QueryLog.project_id == project.project_id,
                QueryLog.country.isnot(None)
            )
            .group_by(
                QueryLog.country,
                QueryLog.city,
                QueryLog.latitude,
                QueryLog.longitude
            )
            .order_by(func.count(QueryLog.log_id).desc())
            .limit(50)
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "requests": {
                "last_day":   day_count,
                "last_week":  week_count,
                "last_month": month_count,
                "last_year":  year_count,
                "total":      totals.total or 0,
            },
            "answers": {
                "answered":   totals.answered or 0,
                "unanswered": totals.unanswered or 0,
            },
            "avg_response_time_ms": round(avg_response_ms, 2),
            "daily_chart": [
                {
                    "date": row.day.strftime("%Y-%m-%d"),
                    "count": row.count
                }
                for row in daily_counts.fetchall()
            ],
            "top_answered_questions": [
                {"question": r.query_text, "count": r.count}
                for r in top_answered.fetchall()
            ],
            "top_unanswered_questions": [
                {"question": r.query_text, "count": r.count}
                for r in top_unanswered.fetchall()
            ],
            "locations": [
                {
                    "country": r.country,
                    "city": r.city,
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "count": r.count
                }
                for r in locations.fetchall()
            ],
        }
    )