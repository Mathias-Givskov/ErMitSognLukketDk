using ermitsognnedeFunctions.Services.Interfaces;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services
{
    public class ZipArchiveService : IZipArchiveService
    {
        public async Task<Stream> GetDistictData(Stream zipArchiveStream)
        {

            var memStream = new MemoryStream();

            using (var archive = new ZipArchive(zipArchiveStream))
            {
                var districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("sognedata-covid-19"));
                await districtEntry.Open().CopyToAsync(memStream);
                return memStream;
            }
        }
    }
}
