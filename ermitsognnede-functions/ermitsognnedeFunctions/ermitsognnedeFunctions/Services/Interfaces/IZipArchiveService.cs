using ermitsognnedeFunctions.Models;
using System.IO;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface IZipArchiveService
    {
        Task<FileModel> GetDistictData(Stream zipArchiveStream);
    }
}
