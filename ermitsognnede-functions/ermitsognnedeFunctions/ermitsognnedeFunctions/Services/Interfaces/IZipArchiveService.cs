using System.IO;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface IZipArchiveService
    {
        Task<Stream> GetDistictData(Stream zipArchiveStream);
    }
}
