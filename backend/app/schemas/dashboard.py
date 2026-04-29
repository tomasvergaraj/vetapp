"""
Schemas para el dashboard admin.
"""
from app.schemas.base import APIBaseModel
from app.schemas.service_request import ServiceRequestListItem


class DashboardStats(APIBaseModel):
    total_requests: int
    pending_requests: int
    scheduled_requests: int
    completed_requests: int
    in_attention_requests: int
    canceled_requests: int


class DashboardResponse(APIBaseModel):
    stats: DashboardStats
    upcoming_appointments: list[ServiceRequestListItem]
    latest_requests: list[ServiceRequestListItem]
