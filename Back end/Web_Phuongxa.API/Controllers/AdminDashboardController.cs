using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/dashboard")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public AdminDashboardController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogsDashboard([FromQuery] int days = 7, [FromQuery] int recentLimit = 20)
        {
            if (days <= 0 || days > 365)
            {
                return BadRequest(new { Message = "days phải trong khoảng từ 1 đến 365." });
            }

            if (recentLimit <= 0 || recentLimit > 200)
            {
                return BadRequest(new { Message = "recentLimit phải trong khoảng từ 1 đến 200." });
            }

            var nowVn = DateTime.UtcNow.AddHours(7);
            var to = nowVn;
            var from = to.AddDays(-days);

            var query = _context.AuditLogs
                .AsNoTracking()
                .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= from && x.CreatedAt.Value <= to);

            var totalLogs = await query.CountAsync();
            var totalUsers = await query.Select(x => x.UserId).Distinct().CountAsync();

            var actionStats = await query
                .GroupBy(x => x.ActionType)
                .Select(g => new
                {
                    ActionType = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            var dailyStats = await query
                .GroupBy(x => x.CreatedAt!.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var recentLogs = await query
                .Include(x => x.User)
                .OrderByDescending(x => x.CreatedAt)
                .Take(recentLimit)
                .Select(x => new
                {
                    x.LogId,
                    x.UserId,
                    UserName = x.User != null ? x.User.FullName : null,
                    x.ActionType,
                    x.TableName,
                    x.RecordId,
                    x.IpAddress,
                    x.Description,
                    x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                Range = new
                {
                    Days = days,
                    From = from,
                    To = to
                },
                Summary = new
                {
                    TotalLogs = totalLogs,
                    TotalUsers = totalUsers
                },
                ActionStats = actionStats,
                DailyStats = dailyStats,
                RecentLogs = recentLogs
            });
        }
    }
}
